from .db import SessionLocal
from .models import Matches
from sqlalchemy import and_


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


def get_matches_history(
    search: str = "",
    radiant_team: str = "",
    dire_team: str = "",
    status: str = "",
    min_duration: int = 0,
    max_duration: int = 9999,
):
    with SessionLocal() as session:
        query = session.query(Matches).filter(
            Matches.status != "In play",
            Matches.DireTeamId != "0"
        )
        
        # Search by match ID
        if search:
            query = query.filter(Matches.match_id.ilike(f"%{search}%"))
        
        # Filter by Radiant team
        if radiant_team:
            query = query.filter(Matches.RadiantTeamName.ilike(f"%{radiant_team}%"))
        
        # Filter by Dire team
        if dire_team:
            query = query.filter(Matches.DireTeamName.ilike(f"%{dire_team}%"))
        
        # Filter by status
        if status:
            query = query.filter(Matches.status == status)
        
        # Filter by duration
        query = query.filter(
            Matches.duration >= min_duration,
            Matches.duration <= max_duration
        )
        
        return query.order_by(Matches.id.desc()).all()
