from fastapi import FastAPI, Depends
from typing import Annotated
from sqlalchemy.orm import Session
from services.config_service import Base, engine, SessionLocal

# NOTE: Keep all table imports here at all times. Table schemas must be imported here to be properly initialized in the database.
from models.db_models import User


def getDb():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)