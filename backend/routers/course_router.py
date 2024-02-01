from fastapi import APIRouter, Depends
from typing import List

from sqlmodel import select, Session

from models.db_models import Course
from models.dto_models import CourseFilters
from services.api_utility_service import get_session

router = APIRouter()


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
