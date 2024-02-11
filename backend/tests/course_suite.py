import random

from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlmodel import Session, select

from models.db_models import User, Course, Node
from models.pydantic_models import Video, Markdown
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
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().owned_courses) == 4

    db.delete(test_course_4)
    db.commit()
    assert len(db.exec(select(Course)).all()) == 3
    assert len(db.exec(select(User).where(User.id == config._tests_user_id)).first().owned_courses) == 3

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


def test_user_node_progress(db: Session, client: TestClient):
    test_user = db.exec(select(User).where(User.id == config._tests_user_id)).first()

    # First, add a large number of nodes to the database to simulate many courses
    cur_node_count = len(db.exec(select(Node)).all())
    cur_courses = db.exec(select(Course)).all()
    for i in range(0, cur_node_count + 10000):
        new_node = Node(title=f'Node {i}', short_description=f'Node {i}', courses=[random.choice(cur_courses)])

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
        db.add(new_node)
    db.commit()

    # Then, simulate the user participating in one of the courses
    cur_courses = db.exec(select(Course)).all()
    cur_course = random.choice(cur_courses)
    db.refresh(cur_course)  # Explicit refresh to ensure course gets the updated node content

    participated_nodes = 0
    node_progress = {}
    node_progress_test_check = {}
    for node in cur_course.nodes:
        # Due to how nodes are persistent across test cases, some nodes may be pre-existing and not have video/markdown
        # content. This could be fixed in the above node generation, but this is easier and achieves the same thing.
        if node.videos is None or node.markdown_files is None:
            continue
        node_id_str = str(node.id)  # The DB does not support UUID-based keys
        for video in node.videos:
            if node_id_str in node_progress:
                node_progress[node_id_str].append(str(video.id))
            else:
                node_progress[node_id_str] = [str(video.id)]

            if node_id_str in node_progress_test_check:
                node_progress_test_check[node_id_str] += 1
            else:
                node_progress_test_check[node_id_str] = 1

            if random.choice([True, False]):
                break

        for markdown in node.markdown_files:
            if node_id_str in node_progress:
                node_progress[node_id_str].append(str(markdown.id))
            else:
                node_progress[node_id_str] = [str(markdown.id)]

            if node_id_str in node_progress_test_check:
                node_progress_test_check[node_id_str] += 1
            else:
                node_progress_test_check[node_id_str] = 1

            if random.choice([True, False]):
                break

        participated_nodes += 1
        if random.choice([True, False]):
            break

    test_user.node_progress = node_progress
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    assert len(test_user.node_progress.keys()) == participated_nodes

    for node_id, completed_content_count in node_progress_test_check.items():
        assert node_id in test_user.node_progress.keys()
        assert len(test_user.node_progress[node_id]) == completed_content_count
