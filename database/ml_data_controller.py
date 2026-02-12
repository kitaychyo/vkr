from sqlalchemy.dialects.postgresql import insert

from .models import SnapshotMatches
from .db import SessionLocal

def insert_match_predict():
    session = SessionLocal()

def update_matches_snapshot(snapshot):
    with SessionLocal() as session:
        stmt = insert(SnapshotMatches).values(**snapshot)
        session.execute(stmt)
        session.commit()


def get_match_snapshot(match_id):
    with SessionLocal() as session:
        match = session.query(SnapshotMatches).filter(SnapshotMatches.match_id == match_id).all()
        return match