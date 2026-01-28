from sqlalchemy.dialects.postgresql import insert

from database.models import LiveMatches
from database.db import SessionLocal

def insert_match_predict():
    session = SessionLocal()
