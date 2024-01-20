from fastapi import APIRouter, Depends
from typing import List

from sqlmodel import select, Session

from models.db_models import Course
from models.dto_models import CourseFilters
from models.pydantic_models import Node
from services.api_utility_service import get_session

router = APIRouter()


# @router.get('/')
# async def test_add_course(db: Session = Depends(get_session)):
#     test_course = Course(title="Test", course_owner_id="HARDCODE ID HERE")
#
#     test_nodes = []
#
#     for i in range(0, 5):
#         test_nodes.append(Node(title=f'Node {i}', short_description=f'Node {i}').model_dump())
#     test_course.nodes = test_nodes
#
#     db.add(test_course)
#     db.commit()


# @router.get('/')
# async def test_get_nodes(db: Session = Depends(get_session)):
#     test_course = db.query(Course).filter(Course.id == "HARDCODE ID HERE").first()
#     node_names = []
#     for node in test_course.nodes:
#         node_names.append(node.title)
#
#     return node_names


@router.post('/search', response_model=List[Course], response_model_by_alias=False)
async def search_courses(filters: CourseFilters, db: Session = Depends(get_session)):
    if not filters:
        return None

    query_statement = select(Course)
    if filters.ids:
        query_statement = query_statement.where(Course.id.in_(filters.ids))
    if filters.owned_by:
        query_statement = query_statement.where(Course.course_owner_id.in_(filters.owned_by))

    # TODO: make this more resilient (i.e. fuzzy searching, case-insensitivity)
    if filters.course_title:
        query_statement = query_statement.where(Course.title.like(f'%{filters.course_title}%'))

    return_obj = db.exec(query_statement).all()
    return return_obj
