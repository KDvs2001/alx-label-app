
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
import logging

# named logger so output shows "SimpleBackbone" as the source module
# CITATION: logging.getLogger() - create a named logger per module
# SOURCE: Python Software Foundation (n.d.). "Logging HOWTO"
# URL: https://docs.python.org/3/howto/logging.html
logger = logging.getLogger("SimpleBackbone")

class SimpleBackbone:
    """
    A fast, offline-first fallback model.
    
    Why HashingVectorizer? 
    Standard TF-IDF blows up memory because it has to keep a massive vocabulary dictionary. 
    Using the hashing trick maps text directly to a fixed-size matrix, which keeps memory usage flat and 
    prevents OOM crashes when deployed on constrained cloud environments (like HuggingFace free tier).
    
    We pair this with an SGD classifier using log-loss so we can do true incremental learning 
    via `partial_fit` every time the user clicks a label.
    """
    def __init__(self, num_labels=2):
        self.num_labels = num_labels
        # HashingVectorizer uses the hashing trick to map tokens to a fixed-size
        # sparse matrix. no vocabulary dict means flat memory usage even on huge corpora.
        # n_features=2**14 (16384) gives a good balance between collisions and speed.
        # CITATION: HashingVectorizer - stateless text vectoriser using the hashing trick
        # SOURCE: scikit-learn (n.d.). "HashingVectorizer"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.HashingVectorizer.html
        self.vectorizer = HashingVectorizer(n_features=2**14, alternate_sign=False)
        
        # SGDClassifier with log_loss gives us logistic regression that supports
        # partial_fit, so we can retrain incrementally every time the user labels.
        # CITATION: SGDClassifier - linear classifier trained with stochastic gradient descent
        # SOURCE: scikit-learn (n.d.). "SGDClassifier"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html
        self.classifier = SGDClassifier(
            loss='log_loss',     # logistic regression (needed for predict_proba)
            penalty='l2',        # L2 regularisation to prevent overfitting
            alpha=0.0001,        # regularisation strength
            random_state=42,     # reproducible weight init
            max_iter=1000,
            tol=1e-3
        )
        self.is_fitted = False
        self.classes_ = list(range(num_labels))
        
        # Initialize with dummy data to set shapes
        self._warmup()
        
    def _warmup(self):
        # partial_fit needs to be called once with all possible classes to
        # initialise the classifier's weight matrix before predict_proba works.
        # CITATION: partial_fit(classes=) - first call must declare all class labels
        # SOURCE: scikit-learn (n.d.). "SGDClassifier.partial_fit"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html#sklearn.linear_model.SGDClassifier.partial_fit
        dummy_X = self.vectorizer.transform(["init"])
        dummy_y = [0]
        self.classifier.partial_fit(dummy_X, dummy_y, classes=self.classes_)
        self.is_fitted = True
        logger.info("SimpleBackbone (TF-IDF/Hash) initialized ready.")

    def predict_proba(self, texts):
        # vectorise the raw text and get per-class probability estimates
        # CITATION: predict_proba() - return class probability estimates for each sample
        # SOURCE: scikit-learn (n.d.). "SGDClassifier.predict_proba"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html#sklearn.linear_model.SGDClassifier.predict_proba
        X = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X)
        
    def predict(self, texts):
        """Return hard class labels for a list of texts.
        Used by the validation phase to compute accuracy against the held-out test set.
        """
        # CITATION: SGDClassifier.predict() - predict class labels for samples
        # SOURCE: scikit-learn (n.d.). "SGDClassifier.predict"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html#sklearn.linear_model.SGDClassifier.predict
        X = self.vectorizer.transform(texts)
        return self.classifier.predict(X)

    def partial_fit(self, texts, labels):
        """Incrementally train on new labeled data."""
        # check we have both classes — SGD can still update weights with one class
        # but the decision boundary won't be meaningful until it's seen both
        unique_labels = set(labels)
        if len(unique_labels) < 2:
            logger.warning(f"Training with only {len(unique_labels)} class: {unique_labels}")
            logger.warning(f"   Model may not learn decision boundary well until both classes are seen")
            logger.warning(f"   Total samples: {len(labels)}, Labels: {labels}")
        
        # transform raw text to the hashed feature matrix then update weights
        # CITATION: vectorizer.transform() - convert text to a sparse feature matrix
        # SOURCE: scikit-learn (n.d.). "HashingVectorizer.transform"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.HashingVectorizer.html#sklearn.feature_extraction.text.HashingVectorizer.transform
        X = self.vectorizer.transform(texts)
        self.classifier.partial_fit(X, labels, classes=self.classes_)
        logger.info(f"Model updated with {len(texts)} samples, unique labels: {unique_labels}")
        return {"status": "success"}


    def load_model(self, path):
        pass # Not implementing persistence for this fallback demo yet
