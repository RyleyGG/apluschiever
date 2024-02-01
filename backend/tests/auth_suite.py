from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlmodel import Session, select

from models.db_models import User, Course
from services.config_service import logger, config


def test_sign_up(db: Session, client: TestClient):
    res = client.post(
        '/auth/sign_up',
        json={
            'email_address': 'test@test.com',
            'first_name': 'joe',
            'last_name': 'test',
            'password': '123'
        }
    )

    assert res.status_code == 200
    assert type(db.exec(select(User).where(User.email_address == 'test@test.com')).first()) == User


def test_sign_in(db: Session, client: TestClient):
    res = client.post(
        '/auth/sign_in',
        json={
            'email_address': 'test@test.com',
            'password': '123'
        }
    )

    if res.status_code == 200:
        config._tests_access_token = res.json()['access_token']
        config._tests_user_id = res.json()['user_id']

    assert res.status_code == 200
