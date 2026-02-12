from .db import SessionLocal
from .models import Matches

def add_matches(match):
    with SessionLocal() as session:
        instance = session.query(Matches).filter(Matches.match_id == match["match_id"]).first()
        if not instance:
            match.pop("PredictRadiant", None)
            match = Matches(**match)
            session.add(match)
            session.commit()

def update_matches(matches):
    with SessionLocal() as session:
        for match in matches:
            instance = session.query(Matches).filter(Matches.match_id != match["match_id"]).first()
            if instance:
                instance.status = "finish"

        session.commit()


def get_matches_history():
    with SessionLocal() as session:
        matches = session.query(Matches).filter(Matches.status != "In play" and Matches.DireTeamId != "0").all()
        return matches



