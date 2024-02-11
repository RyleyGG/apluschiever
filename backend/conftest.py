from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session, select

from api import app
from models.db_models import User, Course, Node
from services.api_utility_service import get_session, dbUrl


@pytest.fixture(name="db", scope="session")
def session_fixture():
    engine = create_engine(dbUrl.replace('@db', '@localhost'))
    SQLModel.metadata.create_all(engine)
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    session.exec(delete(Course))
    session.exec(delete(Node))
    session.exec(delete(User))
    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(name="client", scope="session")
def client_fixture(db: Session):
    def get_session_override():
        return db

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
