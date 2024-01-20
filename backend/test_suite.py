from models.dto_models import SignUpInfo
from services.config_service import logger
from services.config_service import config
from conftest import test_client, db_session

# NOTE: All tests must have db_session and override_db_depend passed in
_accessToken = None


def test_sign_up(test_client, db_session, override_db_depend):
    res = test_client.post(
        '/auth/sign_up',
        json={
            'email_address': 'test@test.com',
            'first_name': 'joe',
            'last_name': 'test',
            'password': '123'
        }
    )

    assert res.status_code == 200


def test_sign_in(test_client, db_session, override_db_depend):
    global _accessToken

    res = test_client.post(
        '/auth/sign_in',
        json={
            'email_address': 'test@test.com',
            'password': '123'
        }
    )

    if res.status_code == 200:
        _accessToken = res.json()['access_token']

    assert res.status_code == 200


def test_basic_auth_check(test_client, db_session, override_db_depend):
    logger.debug(_accessToken)
    res = test_client.get('/', headers={'Authorization': f'Bearer {_accessToken}'})

    assert res.status_code == 200
    assert res.json()['message'] == 'Hello World'
