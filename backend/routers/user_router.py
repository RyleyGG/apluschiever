from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlmodel import Session, select
from starlette import status

from models.db_models import User, Course
from models.dto_models import NodeProgressDetails, UserFilters
from services import auth_service
from services.api_utility_service import get_session

router = APIRouter()


@router.post('/me', response_model=User, response_model_by_alias=False)
async def get_current_user(user: User = Depends(auth_service.validate_token)):
    return user

@router.post('/update_user', response_model=User, response_model_by_alias=False)
async def update_current_user(updated_user: User, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    print(updated_user)
    user.first_name = updated_user.first_name
    user.last_name = updated_user.last_name
    user.email_address = updated_user.email_address
    db.commit()
    return user

@router.post('/course_progress')
async def get_enrolled_course_progress(course_id_list: List[str], user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    # this just goes through one by one and gets each course's progress, theres gotta be a better way
    def get_course_progress(course_id):
        cur_course = db.exec(select(Course).where(Course.id == course_id)).first()

        if not cur_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplied Course ID is invalid",
            )
        course_node_ids = [str(node.id) for node in cur_course.nodes]
        filtered_node_progress = {node_id: progress for node_id, progress in user.node_progress.items() if node_id in course_node_ids}

        # Calculate overall completion percentage
        total_nodes = len(course_node_ids)
        completed_nodes = sum(1 for node_id in course_node_ids if node_id in filtered_node_progress)
        completion_percentage = (completed_nodes / total_nodes) * 100 if total_nodes > 0 else 0

        return completion_percentage

    return_obj = dict()
    for course_id in course_id_list:
        return_obj.update({course_id: get_course_progress(course_id)})
    return return_obj

@router.post('/search_courses', response_model=List[Course], response_model_by_alias=False)
async def get_courses_by_user(user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    return_obj = user.enrolled_courses
    return return_obj

@router.get('/add_course/{course_id}')
async def add_course(course_id: str, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    course_to_add = db.exec(select(Course).where(Course.id == course_id)).first()
    user.enrolled_courses.append(course_to_add)
    db.commit()

@router.get('/remove_course/{course_id}')
async def remove_course(course_id: str, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    course_to_remove = db.exec(select(Course).where(Course.id == course_id)).first()
    if course_to_remove in user.enrolled_courses:
        user.enrolled_courses.remove(course_to_remove)
    db.commit()

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
