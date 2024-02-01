from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlmodel import Session, select

from models.db_models import User, Course, Node
from models.pydantic_models import Video, Markdown
from services.config_service import logger
from services.config_service import config


def test_add_courses_and_nodes(db: Session, client: TestClient):
    test_course_1 = Course(title='Test 1', course_owner_id=config._tests_user_id)
    test_course_2 = Course(title='Test 2', course_owner_id=config._tests_user_id)
    test_course_3 = Course(title='Test 3', course_owner_id=config._tests_user_id)
    test_course_4 = Course(title='Test 4', course_owner_id=config._tests_user_id)

    test_nodes = []
    for i in range(0, 5):
        new_node = Node(title=f'Node {i}', short_description=f'Node {i}')
        if i % 2 == 0:
            new_node.videos = [Video(title='wasd', embed_link='wasd', video_source='wasd')]
        else:
            new_node.markdown_files = [Markdown(title='wasd', content='###wasd')]
        test_nodes.append(new_node)

    db.add(test_course_1)
    db.add(test_course_2)
    db.add(test_course_3)
    db.add(test_course_4)

    for node in test_nodes:
        db.add(node)
    db.commit()

    assert len(db.exec(select(Course)).all()) == 4
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().courses) == 4

    db.delete(test_course_4)
    db.commit()
    assert len(db.exec(select(Course)).all()) == 3
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().courses) == 3

    assert len(db.exec(select(Node)).all()) == 5


def test_node_course_connection(db: Session, client: TestClient):
    test_course_1 = db.exec(select(Course).where(Course.title == 'Test 1')).first()
    test_course_2 = db.exec(select(Course).where(Course.title == 'Test 2')).first()
    assert test_course_1.nodes == []

    test_node_1 = db.exec(select(Node).where(Node.title == 'Node 1')).first()
    test_node_2 = db.exec(select(Node).where(Node.title == 'Node 2')).first()
    test_node_3 = db.exec(select(Node).where(Node.title == 'Node 3')).first()
    assert test_node_1.courses == []

    test_course_1.nodes = [test_node_1]
    test_course_2.nodes = [test_node_1, test_node_2, test_node_3]
    db.add(test_course_1)
    db.add(test_course_2)
    db.refresh(test_course_1)
    db.refresh(test_course_2)
    db.refresh(test_node_1)
    db.refresh(test_course_2)

    assert len(test_course_1.nodes) == 1
    assert len(test_course_2.nodes) == 3

    assert len(test_node_1.courses) == 2