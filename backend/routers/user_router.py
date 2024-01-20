from fastapi import APIRouter, Depends
from db import getDb
from sqlalchemy.orm import Session
from typing import List

from models.db_models import User as UserDb
from models.pydantic_models import User as UserPyd
from models.dto_models import UserFilters

router = APIRouter()


@router.post('/search', response_model=List[UserPyd], response_model_by_alias=False)
def search_users(filters: UserFilters, db: Session = Depends(getDb)):
    if not filters:
        return None

    return_obj = db.query(UserDb)
    if filters.ids:
        return_obj = return_obj.filter(UserDb.id.in_(filters.ids))
    if filters.emails:
        return_obj = return_obj.filter(UserDb.email_address.in_(filters.emails))

    return return_obj
