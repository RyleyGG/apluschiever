from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session, select

from api import app
from models.db_models import User, Course
from services.api_utility_service import get_session, dbUrl


# @pytest.fixture(scope="module")
# def override_db_depend(db_session):
#     app.dependency_overrides[get_session] = lambda: db_session
#     yield
#     app.dependency_overrides.pop(get_session, None)
#
#
# @pytest.fixture(scope="module")
# def test_client():
#     with TestClient(app) as client:
#         yield client
#
#
# @pytest.fixture(scope="module")
# def db_session():
#     engine = create_engine(dbUrl.replace('@db', '@localhost'))
#     TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#     connection = engine.connect()
#     transaction = connection.begin()
#     SQLModel.metadata.create_all(engine)
#     db = TestingSessionLocal(bind=connection)
#
#     # delete all data before starting tests
#     db.query(User).delete()
#     db.commit()
#
#     yield db
#
#     transaction.rollback()
#     connection.close()

@pytest.fixture(name="db", scope="module")
def session_fixture():
    engine = create_engine(dbUrl.replace('@db', '@localhost'))
    SQLModel.metadata.create_all(engine)
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    session.exec(delete(Course))
    session.exec(delete(User))
    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(name="client", scope="module")
def client_fixture(db: Session):
    def get_session_override():
        return db

    app.dependency_overrides[get_session] = get_session_override

    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
