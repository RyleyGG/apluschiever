from fastapi import APIRouter, Depends
from db import getDb
from sqlalchemy.orm import Session
from typing import List

from models.db_models import Course as CourseDb
from models.pydantic_models import Course as CoursePyd, Node
from models.dto_models import CourseFilters, NewCourse

router = APIRouter()


# @router.get('/')
# async def test_add_course(db: Session = Depends(getDb)):
#     test_course = CourseDb(title="Test", course_owner_id="HARDCODE ID HERE")
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
# async def test_add_course(db: Session = Depends(getDb)):
#     test_course = db.query(CourseDb).filter(CourseDb.id == "HARDCODE ID HERE").first()
#     node_names = []
#     for node in test_course.nodes:
#         node_names.append(node.title)
#
#     return node_names

@router.post('/search', response_model=List[CoursePyd], response_model_by_alias=False)
async def search_courses(filters: CourseFilters, db: Session = Depends(getDb)):
    if not filters:
        return None

    return_obj = db.query(CourseDb)
    if filters.ids:
        return_obj = return_obj.filter(CourseDb.id.in_(filters.ids))
    if filters.owned_by:
        return_obj = return_obj.filter(CourseDb.course_owner_id.in_(filters.owned_by))

    # TODO: make this more resilient (i.e. fuzzy searching, case-insensitivity)
    if filters.course_title:
        return_obj = return_obj.filter(CourseDb.title.like(f'%{filters.course_title}%'))

    return return_obj
