from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from api import app
from db import Base, getDb
from services.config_service import dbUrl
from models.db_models import User

@pytest.fixture(scope="module")
def overrideDbDepend(dbSession):
    app.dependency_overrides[getDb] = lambda: dbSession
    yield
    app.dependency_overrides.pop(getDb, None)
    
@pytest.fixture(scope="module")
def testClient():
    with TestClient(app) as client:
        yield client
        
@pytest.fixture(scope="module")
def dbSession():
    engine = create_engine(dbUrl.replace('@db', '@localhost'))
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    connection = engine.connect()
    transaction = connection.begin()
    Base.metadata.bind = engine
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal(bind=connection)

    # delete all data before starting tests
    db.query(User).delete()
    db.commit()

    yield db

    transaction.rollback()
    connection.close()