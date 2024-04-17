import uuid

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlalchemy.orm.attributes import flag_modified
from sqlmodel import select, Session
from starlette import status

from models.db_models import Course, User, Node
from models.dto_models import CourseFilters, NodeProgressDetails, NodeFilters
from services import auth_service
from services.api_utility_service import get_session


router = APIRouter()

@router.get('/view_node/{node_id}', response_model=Node, response_model_by_alias=False)
async def get_node_content(node_id: str, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    cur_node = db.exec(select(Node).where(Node.id == node_id)).first()

    if not cur_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplied Node ID is invalid",
        )
    return cur_node

@router.post('/search', response_model=List[Node], response_model_by_alias=False)
async def search_nodes(filters: NodeFilters, db: Session = Depends(get_session)):
    query_statement = select(Node)
    if filters.ids:
        query_statement = query_statement.where(Node.id.in_(filters.ids))
    if filters.course_ids:
        query_statement = query_statement.where(Node.courses.any(Course.id.in_(filters.course_ids)))

    return_obj = db.exec(query_statement).all()
    return return_obj


@router.get('/progress/{course_id}', response_model=List[NodeProgressDetails], response_model_by_alias=False)
async def get_node_progress_by_course(course_id: str, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    cur_course = db.exec(select(Course).where(Course.id == course_id)).first()

    if not cur_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplied Course ID is invalid",
        )
    course_node_ids = [str(node.id) for node in cur_course.nodes]
    completed_nodes = [node_id for node_id in course_node_ids if node_id in user.node_progress]

    ret_obj = []
    for completed_id in completed_nodes:
        ret_obj.append(NodeProgressDetails(node_id=completed_id, node_complete=True))

    return ret_obj


@router.post('/update_node', response_model=NodeProgressDetails, response_model_by_alias=False)
async def update_node_progress(update_obj: NodeProgressDetails, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    print(update_obj)
    print(user.node_progress)
    if update_obj.node_complete and update_obj.node_id not in user.node_progress:
        user.node_progress.append(uuid.UUID(update_obj.node_id))
    elif not update_obj.node_complete and update_obj.node_id in user.node_progress:
        user.node_progress.pop(user.node_progress.index(uuid.UUID(update_obj.node_id)))

    flag_modified(user, "node_progress")
    db.add(user)
    db.commit()

    return update_obj
