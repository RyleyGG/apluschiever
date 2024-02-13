import uuid

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlmodel import select, Session
from starlette import status

from models.db_models import Course, User, Node, NodeOverview
from models.dto_models import CourseFilters, NodeProgressDetails
from services import auth_service
from services.api_utility_service import get_session


router = APIRouter()


@router.post('/search', response_model=List[Course], response_model_by_alias=False)
async def search_courses(filters: CourseFilters, db: Session = Depends(get_session)):
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


@router.get('/nodes/{course_id}', response_model=List[NodeOverview], response_model_by_alias=False)
async def get_node_overview(course_id: str, db: Session = Depends(get_session)):
    cur_course = db.exec(select(Course).where(Course.id == course_id)).first()

    if not cur_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplied Course ID is invalid",
        )
    course_node_ids = [str(node.id) for node in cur_course.nodes]
    course_nodes = db.exec(select(Node).where(Node.id.in_(course_node_ids))).all()

    node_overview = [NodeOverview(id=node.id, title=node.title, parent_nodes=node.parents) for node in course_nodes]
    return node_overview
