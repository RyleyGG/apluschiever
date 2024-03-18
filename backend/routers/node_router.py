import uuid

from fastapi import APIRouter, Depends, HTTPException
from typing import List

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

@router.post('/search', response_model=List[Course], response_model_by_alias=False)
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
    filtered_node_progress = {node_id: progress for node_id, progress in user.node_progress.items() if node_id in course_node_ids}

    node_progress_list = []
    for k, v in filtered_node_progress.items():
        node_progress_list.append(NodeProgressDetails(node_id=k, progress=v))
    return node_progress_list


@router.post('/update_node', response_model=NodeProgressDetails, response_model_by_alias=False)
async def update_node_progress(update_obj: NodeProgressDetails, user: User = Depends(auth_service.validate_token), db: Session = Depends(get_session)):
    if update_obj.node_id not in user.node_progress.keys():
        user.node_progress[uuid.UUID(update_obj.node_id)] = [uuid.UUID(content_id) for content_id in update_obj.completed_content]
    db.add(user)
    db.commit()

    return NodeProgressDetails
