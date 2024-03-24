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
    query_statement = select(Course).order_by(Course.title)
    if filters.ids:
        query_statement = query_statement.where(Course.id.in_(filters.ids))
    if filters.owned_by:
        query_statement = query_statement.where(Course.course_owner_id.in_(filters.owned_by))
    if filters.is_published is not None:
        query_statement = query_statement.where(Course.is_published == True if filters.is_published else Course.is_published == False)

    # TODO: make this more resilient (i.e. fuzzy searching, case-insensitivity)
    if filters.course_title:
        query_statement = query_statement.where(Course.title.like(f'%{filters.course_title}%'))

    return_obj = db.exec(query_statement).all()
    return return_obj


@router.post('/add_or_update', response_model=Course, response_model_by_alias=False)
async def add_or_update_course(course: Course, db: Session = Depends(get_session)):
    course_has_valid_id = False
    try:
        uuid.UUID(course.id)
        course_has_valid_id = True
    except ValueError:
        pass

    if course_has_valid_id:
        existing_course = db.exec(select(Course).where(Course.id == course.id)).first()

        if existing_course:
            existing_course.title = course.title
            existing_course.short_description = course.short_description
            existing_course.nodes = course.nodes
            existing_course.is_published = course.is_published
            db.add(existing_course)
            db.commit()
            db.refresh(existing_course)
            return existing_course
    else:
        course.id = None
        db.add(course)
        db.commit()
        db.refresh(course)
        return course


@router.get('/nodes/{course_id}', response_model=List[NodeOverview], response_model_by_alias=False)
async def get_node_overview(course_id: str, db: Session = Depends(get_session), user: User = Depends(auth_service.validate_token)):
    cur_course = db.exec(select(Course).where(Course.id == course_id)).first()

    if not cur_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Supplied Course ID is invalid",
        )
    course_node_ids = [str(node.id) for node in cur_course.nodes]
    course_nodes = db.exec(select(Node).where(Node.id.in_(course_node_ids))).all()

    node_overview = [
        NodeOverview(
            id = node.id,
            title = node.title,
            short_description = node.short_description,
            parent_nodes = node.parents,
            complete = (node.id in user.node_progress.keys()) and 
                (node.videos is not None and set([file.id for file in node.videos]).issubset(set(user.node_progress[node.id]))) and 
                (node.markdown_files is not None and set([file.id for file in node.markdown_files]).issubset(set(user.node_progress[node.id]))) and
                (node.uploaded_files is not None and set([file.id for file in node.uploaded_files]).issubset(set(user.node_progress[node.id]))) and
                (node.third_party_resources is not None and set([file.id for file in node.third_party_resources]).issubset(set(user.node_progress[node.id]))),
            tags = [], #node.tags,
            content_types = [key for key in ["videos", "markdown_files", "uploaded_files", "third_party_resources"] if node.model_dump().get(key) is not None] # We will need to update this listing with new content types as we add more support for them. Maybe this can be turned into a setting somehow?
        ) for node in course_nodes
    ]
    return node_overview
