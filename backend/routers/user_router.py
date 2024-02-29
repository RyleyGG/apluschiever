from fastapi import APIRouter, Depends
from typing import List

from sqlmodel import Session, select

from models.db_models import User, Course
from models.dto_models import UserFilters
from services import auth_service
from services.api_utility_service import get_session

router = APIRouter()


@router.post('/search_courses', response_model=List[Course], response_model_by_alias=False)
async def get_courses_by_user(user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    query_statement = select(Course)
    query_statement = query_statement.where(Course.course_owner_id == user.id)
    return_obj = db.exec(query_statement).all()
    return return_obj

@router.post('/search', response_model=List[User], response_model_by_alias=False)
async def search_users(filters: UserFilters, db: Session = Depends(get_session)):
    if not filters:
        return None

    query_statement = select(User)
    if filters.ids:
        query_statement = query_statement.where(User.id.in_(filters.ids))
    if filters.emails:
        query_statement = query_statement.where(User.email_address.in_(filters.emails))
    if filters.user_types:
        query_statement = query_statement.where(User.user_type.in_(filters.user_types))

    return_obj = db.exec(query_statement).all()
    return return_obj
