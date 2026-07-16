import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
import logging

# named logger so output shows "SimpleBackbone" as the source module
logger = logging.getLogger("SimpleBackbone")

class SimpleBackbone:
    """
    A Local Private Committee (Multi-AI Consensus Ensemble) model.
    
    Why HashingVectorizer? 
    Standard TF-IDF blows up memory because it has to keep a massive vocabulary dictionary. 
    Using the hashing trick maps text directly to a fixed-size matrix, which keeps memory usage flat.
    
    Why Committee Ensemble?
    Instead of relying on a single classifier, we train a committee of 3 distinct linear classifiers 
    locally in our private environment. During prediction, auto-labeling is approved ONLY if all 
    three models agree on the class index. If there is a disagreement, the confidence drops to 
    neutral (forcing human verification), preventing model bias/collapse securely and privately.
    """
    def __init__(self, num_labels=2):
        self.num_labels = num_labels
        self.vectorizer = HashingVectorizer(n_features=2**14, alternate_sign=False)
        
        # Classifier 1: SGD Logistic Regression with L2 Penalty
        self.classifier_l2 = SGDClassifier(
            loss='log_loss',
            penalty='l2',
            alpha=0.0001,
            random_state=42,
            max_iter=1000,
            tol=1e-3
        )
        
        # Classifier 2: SGD Logistic Regression with ElasticNet Penalty
        self.classifier_elastic = SGDClassifier(
            loss='log_loss',
            penalty='elasticnet',
            alpha=0.0001,
            random_state=42,
            max_iter=1000,
            tol=1e-3
        )
        
        # Classifier 3: SGD Smooth SVM (Modified Huber loss supports predict_proba)
        self.classifier_huber = SGDClassifier(
            loss='modified_huber',
            alpha=0.0001,
            random_state=42,
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
        dummy_X = self.vectorizer.transform(["init"])
        dummy_y = [0]
        self.classifier_l2.partial_fit(dummy_X, dummy_y, classes=self.classes_)
        self.classifier_elastic.partial_fit(dummy_X, dummy_y, classes=self.classes_)
        self.classifier_huber.partial_fit(dummy_X, dummy_y, classes=self.classes_)
        self.is_fitted = True
        logger.info("Local Private Committee (L2 + ElasticNet + Huber SVM) initialized ready.")

    def predict_proba(self, texts):
        """Return consensus class probability estimates for each sample."""
        X = self.vectorizer.transform(texts)
        p1 = self.classifier_l2.predict_proba(X)
        p2 = self.classifier_elastic.predict_proba(X)
        p3 = self.classifier_huber.predict_proba(X)
        
        result_probs = []
        for idx in range(len(texts)):
            pred1 = np.argmax(p1[idx])
            pred2 = np.argmax(p2[idx])
            pred3 = np.argmax(p3[idx])
            
            # Consensus: Only auto-label if the local committee agrees on the class index
            if pred1 == pred2 == pred3:
                # Committee agreement: return average probability vector
                avg_prob = (p1[idx] + p2[idx] + p3[idx]) / 3.0
                result_probs.append(avg_prob)
            else:
                # Committee disagreement: set probability to a flat distribution
                # (e.g. 0.5 for binary), which drops confidence below threshold, forcing human review
                flat_prob = np.ones(self.num_labels) / self.num_labels
                result_probs.append(flat_prob)
                
        return np.array(result_probs)
        
    def predict(self, texts):
        """Return consensus class labels based on ensemble predictions."""
        probs = self.predict_proba(texts)
        return np.argmax(probs, axis=1)

    def partial_fit(self, texts, labels):
        """Incrementally train all committee members on new labeled data."""
        unique_labels = set(labels)
        if len(unique_labels) < 2:
            logger.warning(f"Training with only {len(unique_labels)} class: {unique_labels}")
        
        X = self.vectorizer.transform(texts)
        self.classifier_l2.partial_fit(X, labels, classes=self.classes_)
        self.classifier_elastic.partial_fit(X, labels, classes=self.classes_)
        self.classifier_huber.partial_fit(X, labels, classes=self.classes_)
        
        logger.info(f"Committee updated with {len(texts)} samples, unique labels: {unique_labels}")
        return {"status": "success"}

    def load_model(self, path):
        pass
