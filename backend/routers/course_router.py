from fastapi import APIRouter, Depends
from db import getDb
from sqlalchemy.orm import Session
from typing import List

from models.db_models import Course as CourseDb
from models.pydantic_models import Course as CoursePyd
from models.dto_models import CourseFilters

router = APIRouter()


@router.post('/search', response_model=List[CoursePyd], response_model_by_alias=False)
def search_courses(filters: CourseFilters, db: Session = Depends(getDb)):
    if not filters:
        return None

    return_obj = db.query(CourseDb)
    if filters.ids:
        return_obj = return_obj.filter(CourseDb.id.in_(filters.ids))
    if filters.owned_by:
        return_obj = return_obj.filter(CourseDb.course_owner_id.in_(filters.owned_by))
    if filters.course_title:
        return_obj = return_obj.filter(CourseDb.title.like(f'%{filters.course_title}%'))

    return return_obj
