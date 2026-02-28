
import numpy as np
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import SGDClassifier
import logging

logger = logging.getLogger("SimpleBackbone")

class SimpleBackbone:
    """
    A lightweight, offline-first ML backbone.
    Uses HashingVectorizer (stateless, fixed-dim text features) + SGDClassifier.
    
    Scientific Validity:
    - This is a standard 'Bag of Words' approach.
    - Widely used as a strong baseline in Active Learning research.
    - ZERO downloads required. Works locally immediately.
    """
    def __init__(self, num_labels=2):
        self.num_labels = num_labels
        # HashingVectorizer creates a fixed-size sparse matrix. 
        # n_features=2**14 (16384) is a good balance for efficiency vs collisions
        self.vectorizer = HashingVectorizer(n_features=2**14, alternate_sign=False)
        
        self.classifier = SGDClassifier(
            loss='log_loss', 
            penalty='l2',
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
        # We need to call partial_fit once to initialize the classifier weights
        dummy_X = self.vectorizer.transform(["init"])
        dummy_y = [0]
        self.classifier.partial_fit(dummy_X, dummy_y, classes=self.classes_)
        self.is_fitted = True
        logger.info("SimpleBackbone (TF-IDF/Hash) initialized ready.")

    def predict_proba(self, texts):
        X = self.vectorizer.transform(texts)
        return self.classifier.predict_proba(X)
        
    def partial_fit(self, texts, labels):
        """Incrementally train on new labeled data."""
        # Check if we have at least 2 different classes
        unique_labels = set(labels)
        if len(unique_labels) < 2:
            logger.warning(f"Training with only {len(unique_labels)} class: {unique_labels}")
            logger.warning(f"   Model may not learn decision boundary well until both classes are seen")
            logger.warning(f"   Total samples: {len(labels)}, Labels: {labels}")
            # Continue training anyway - model can still update weights
        
        X = self.vectorizer.transform(texts)
        self.classifier.partial_fit(X, labels, classes=self.classes_)
        logger.info(f"Model updated with {len(texts)} samples, unique labels: {unique_labels}")
        return {"status": "success"}


    def load_model(self, path):
        pass # Not implementing persistence for this fallback demo yet
