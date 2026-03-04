from .db import SessionLocal
from .models import Matches


def add_matches(match):
    with SessionLocal() as session:
        instance = session.query(Matches).filter(Matches.match_id == match["match_id"]).first()
        if not instance:
            match.pop("PredictRadiant", None)
            new_match = Matches(**match)
            session.add(new_match)
            session.commit()


def update_matches(matches):
    """Mark matches that are no longer live as finished."""
    active_ids = [m["match_id"] for m in matches]
    with SessionLocal() as session:
        stale = session.query(Matches).filter(
            Matches.status == "In play",
            ~Matches.match_id.in_(active_ids)
        ).all()
        for m in stale:
            m.status = "finish"
        session.commit()


def get_matches_history():
    with SessionLocal() as session:
        return (
            session.query(Matches)
            .filter(Matches.status != "In play", Matches.DireTeamId != "0")
            .all()
        )
