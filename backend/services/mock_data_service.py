from fastapi import HTTPException
from sqlalchemy import create_engine, delete
from sqlmodel import SQLModel, Session
from fastapi.testclient import TestClient
from starlette import status

from api import app
from models.db_models import Course, Node, User
from services.api_utility_service import dbUrl, get_session
from services.config_service import config


def generate_mock_users(db: Session, client: TestClient):
    res = client.post(
        '/auth/sign_up',
        json={
            'email_address': 'test@test.com',
            'first_name': 'joe',
            'last_name': 'test',
            'password': '123'
        }
    )

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
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not authenticate mock user",
        )


def generate_mock_courses(db: Session, client: TestClient):
    test_course_1 = Course(title='Test 1', course_owner_id=config._tests_user_id)
    db.add(test_course_1)
    new_node = Node(title=f'TEST', short_description=f'TEST', courses=[test_course_1])
    db.add(new_node)
    db.commit()


def main():
    # Prep DB conn
    engine = create_engine(dbUrl.replace('@db', '@localhost'))
    SQLModel.metadata.create_all(engine)
    connection = engine.connect()
    #
    # Prep session
    session = Session(bind=connection)
    session.exec(delete(Course))
    session.exec(delete(Node))
    session.exec(delete(User))

    # Prep client
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)

    # Generate mock data
    generate_mock_users(session, client)
    generate_mock_courses(session, client)

    # Close conn
    app.dependency_overrides.clear()
    session.close()
    connection.close()


if __name__ == '__main__':
    main()
