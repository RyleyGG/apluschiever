import json
import math
import random

from fastapi import HTTPException
from sqlalchemy import create_engine, delete
from sqlalchemy.orm.attributes import flag_modified
from sqlmodel import SQLModel, Session, select
from fastapi.testclient import TestClient
from starlette import status

from api import app
from models.db_models import Course, Node, User, NodeParentLink
from models.dto_models import NodeTags, UserType
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
        '/auth/sign_up',
        json={
            'email_address': 'test@teacher.com',
            'first_name': 'joe',
            'last_name': 'teacher',
            'password': '123',
            'user_type': 'Teacher'
        }
    )

    student_res = client.post(
        '/auth/sign_in',
        data={
            'username': 'test@test.com',
            'password': '123'
        }
    )

    teacher_res = client.post(
        '/auth/sign_in',
        data={
            'username': 'test@teacher.com',
            'password': '123'
        }
    )

    if student_res.status_code == 200:
        config._tests_access_token = student_res.json()['access_token']
        config._tests_user_id = student_res.json()['user_id']
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not authenticate mock student",
        )

    if teacher_res.status_code == 200:
        config._tests_teacher_id = teacher_res.json()['user_id']
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not authenticate mock teacher",
        )


def generate_mock_courses(db: Session, client: TestClient):
    for i in range(25):
        mock_course = Course(title=f'Course #{i + 1}', course_owner_id=config._tests_teacher_id)
        db.add(mock_course)
    db.commit()


def generate_mock_nodes(db: Session, client: TestClient):
    mock_courses = db.exec(select(Course)).all()
    test_user = db.exec(select(User).where(User.id == config._tests_user_id)).first()
    user_node_progress = {}
    for i in range(len(mock_courses)):
        cur_course = mock_courses[i]
        node_layers = {}
        node_cnt = 0
        keep_completing = True
        node_complete_chance = 100
        for x in range(0, 5):
            layer_node_cnt = random.randint(1, 10)
            node_layers[x] = []
            for y in range(0, layer_node_cnt):
                new_node = Node(title=f'Node {node_cnt}', short_description=f'Node {node_cnt}', course=cur_course)

                # Adding content
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

                # Adding tags
                new_node.tags = []
                if random.choice([True, False]):
                    new_node.tags.append(NodeTags.CORE)
                if random.choice([True, False]):
                    new_node.tags.append(NodeTags.ASSESSMENT)
                if random.choice([True, False]):
                    new_node.tags.append(NodeTags.PRACTICE)
                if random.choice([True, False]):
                    new_node.tags.append(NodeTags.SUPPLEMENTAL)

                # Adding parent(s)
                parent_count = random.randint(1, math.ceil(len(node_layers[x - 1]) / 2)) if x > 0 else 0
                new_node.parents = []
                while len(new_node.parents) != parent_count:
                    rand_node = random.choice(node_layers[x - 1])
                    if rand_node not in new_node.parents:
                        new_node.parents.append(rand_node)
                node_layers[x].append(new_node)
                db.add(new_node)
                db.commit()
                db.refresh(new_node)
                db.refresh(test_user)

                # Setting completion status
                if random.randint(1, 100) <= node_complete_chance and keep_completing:
                    node_complete_chance -= 2
                    user_node_progress[str(new_node.id)] = []
                    for video in new_node.videos:
                        user_node_progress[str(new_node.id)].append(str(video.id))
                    for markdown in new_node.markdown_files:
                        user_node_progress[str(new_node.id)].append(str(markdown.id))
                else:
                    keep_completing = False

                node_cnt += 1

    test_user.node_progress = user_node_progress
    flag_modified(test_user, "node_progress")
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

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
