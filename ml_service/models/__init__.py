# Initialize the models package.
# We explicitly keep this file here because some WSGI deployment servers (like Gunicorn/Waitress)
# can be finicky about implicit namespace packages, and we need to guarantee the 'models' directory 
# is correctly recognized as an importable module when deploying the thesis backend.

from .cal_log_ranker import CALLogRanker

# Expose only the ranker to keep the main server logic clean and prevent namespace pollution
__all__ = ['CALLogRanker']
