from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlmodel import Session, select

from models.db_models import User, Course
from models.pydantic_models import Node
from services.config_service import logger
from services.config_service import config


def test_add_courses(db: Session, client: TestClient):
    test_course_1 = Course(title='Test 1', course_owner_id=config._tests_user_id)
    test_course_2 = Course(title='Test 2', course_owner_id=config._tests_user_id)
    test_course_3 = Course(title='Test 3', course_owner_id=config._tests_user_id)

    test_nodes = []

    for i in range(0, 5):
        test_nodes.append(Node(title=f'Node {i}', short_description=f'Node {i}').model_dump())
    test_course_1.nodes = test_nodes

    db.add(test_course_1)
    db.add(test_course_2)
    db.add(test_course_3)
    db.commit()

    assert len(db.exec(select(Course)).all()) == 3
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().courses) == 3

    db.delete(test_course_2)
    db.commit()
    assert len(db.exec(select(Course)).all()) == 2
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().courses) == 2


def test_get_nodes(db: Session, client: TestClient):
    test_course = db.exec(select(Course).where(Course.title == 'Test 1')).first()
    node_names = []
    for node in test_course.nodes:
        node_names.append(node.title)

    assert len(node_names) == 5
    assert node_names[0] == 'Node 0'
