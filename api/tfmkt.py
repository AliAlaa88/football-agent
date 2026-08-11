import sys
import os

# Add the transfermarkt-api directory to the python path so absolute imports work
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'transfermarkt-api'))

from app.main import app as _app
from fastapi import FastAPI

app = FastAPI()
app.mount("/api/tfmkt", _app)
