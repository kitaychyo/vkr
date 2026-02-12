from sqlalchemy.dialects.postgresql import insert

from .models import DataForPredict
from .db import SessionLocal

def update_data_for_predict(match_id, snapshot):
    with SessionLocal() as session:
        stmt = insert(DataForPredict).values(match_id = match_id, data_for_predict=snapshot)
        session.execute(stmt)
        session.commit()

def get_match_snapshots_for_predict(match_id):
    with SessionLocal() as session:
        data = session.query(DataForPredict).filter(DataForPredict.match_id == match_id).all()
        return data
