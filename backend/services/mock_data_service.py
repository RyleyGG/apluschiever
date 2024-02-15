import random

from fastapi import HTTPException
from sqlalchemy import create_engine, delete
from sqlmodel import SQLModel, Session, select
from fastapi.testclient import TestClient
from starlette import status

from api import app
from models.db_models import Course, Node, User, NodeParentLink
from models.pydantic_models import Video, Markdown
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
    for i in range(25):
        mock_course = Course(title=f'Course #{i + 1}', course_owner_id=config._tests_user_id)
        db.add(mock_course)
    db.commit()


def generate_mock_nodes(db: Session, client: TestClient):
    mock_courses = db.exec(select(Course)).all()
    for x in range(len(mock_courses)):
        cur_course = mock_courses[x]
        node_list = []
        for y in range(0, 100):
            new_node = Node(title=f'Node {y}', short_description=f'Node {y}', course=cur_course)

            new_node.videos = []
            new_node.markdown_files = []
            for n in range(10):
                new_node.videos.append(Video(title='wasd', embed_link='wasd', video_source='wasd'))
                if random.choice([True, False]):
                    break

            for n in range(10):
                new_node.markdown_files.append(Markdown(title='wasd', content='###wasd'))
                if random.choice([True, False]):
                    break
            new_node.parents = [node_list[-1]] if len(node_list) > 0 else []
            node_list.append(new_node)
            db.add(new_node)
    db.commit()


def main():
    # Prep DB conn
    engine = create_engine(dbUrl.replace('@db', '@localhost'))
    SQLModel.metadata.create_all(engine)
    connection = engine.connect()

    # Prep session
    session = Session(bind=connection)
    session.exec(delete(NodeParentLink))
    session.exec(delete(Node))
    session.exec(delete(Course))
    session.exec(delete(User))

    # Prep client
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)

    # Generate mock data
    generate_mock_users(session, client)
    generate_mock_courses(session, client)
    generate_mock_nodes(session, client)

    # Close conn
    app.dependency_overrides.clear()
    session.close()
    connection.close()


if __name__ == '__main__':
    main()
