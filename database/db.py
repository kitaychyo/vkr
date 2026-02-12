from sqlalchemy.orm import sessionmaker
from .models import LiveMatches, Base
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DATABASE_URL = (
    f"postgresql+psycopg2://"
    f"{os.getenv('POSTGRES_USER')}:"
    f"{os.getenv('POSTGRES_PASSWORD')}@"
    f"{os.getenv('POSTGRES_HOST')}:"
    f"{os.getenv('POSTGRES_PORT')}/"
    f"{os.getenv('POSTGRES_DB')}"
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)