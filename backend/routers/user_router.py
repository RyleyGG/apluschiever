from fastapi import APIRouter, Depends
from typing import List

from sqlmodel import Session, select

from models.db_models import User
from models.dto_models import UserFilters
from services.api_utility_service import get_session

router = APIRouter()


@router.post('/search', response_model=List[User], response_model_by_alias=False)
async def search_users(filters: UserFilters, db: Session = Depends(get_session)):
    if not filters:
        return None

    query_statement = select(User)
    if filters.ids:
        query_statement = query_statement.where(User.id.in_(filters.ids))
    if filters.emails:
        query_statement = query_statement.where(User.email_address.in_(filters.emails))

    return_obj = db.exec(query_statement).all()
    return return_obj
