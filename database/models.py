from sqlalchemy import Column, Integer, BigInteger, DateTime, func, Boolean, Text, String, Float
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


class AllMatches(Base):
    __tablename__ = "all_matches"

    id = Column(Integer, primary_key=True)
    match_id = Column(BigInteger, nullable=False, unique=True)
    match_result = Column(Boolean, default=None)
    collected_at = Column(DateTime, server_default=func.now())


class LiveMatches(Base):
    __tablename__ = "live_matches"

    id = Column(Integer, primary_key=True)
    match_id = Column(BigInteger, nullable=False, unique=True)
    duration = Column(BigInteger)

    DireTeamName = Column(Text)
    DireTeamId = Column(String)
    DireLogoTeamId = Column(String)

    RadiantTeamName = Column(Text)
    RadiantTeamId = Column(String)
    RadiantLogoTeamId = Column(String)

    PredictRadiant = Column(Float)


class SnapshotMatches(Base):
    __tablename__ = "snapshot_matches"

    id = Column(Integer, primary_key=True)
    match_id = Column(BigInteger, nullable=False, unique=False)
    duration = Column(BigInteger)

    full_match_data = Column(JSONB)

    predict_radiant = Column(Float)

class Matches(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True)
    match_id = Column(BigInteger, nullable=False, unique=True)
    duration = Column(BigInteger)

    DireTeamName = Column(Text)
    DireTeamId = Column(String)
    DireLogoTeamId = Column(String)

    RadiantTeamName = Column(Text)
    RadiantTeamId = Column(String)
    RadiantLogoTeamId = Column(String)

    status = Column(String)