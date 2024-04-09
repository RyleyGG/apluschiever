import uuid

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlmodel import select, Session
from starlette import status

from models.db_models import Course, User, Node, NodeOverview, UpdatedCourse
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


@router.post('/add_or_update', response_model=UpdatedCourse, response_model_by_alias=False)
async def add_or_update_course(course: Course, nodes: List[Node], db: Session = Depends(get_session), user: User = Depends(auth_service.validate_token)):
    print(course)
    existing_course = None
    if course.id:
        existing_course = db.exec(select(Course).where(Course.id == course.id)).first()

    if existing_course:
        existing_course.title = course.title
        existing_course.short_description = course.short_description
        existing_course.is_published = course.is_published
        db.add(existing_course)
        db.commit()
        db.refresh(existing_course)
        cur_course_id = existing_course.id
    else:
        course.id = None
        course.course_owner_id = user.id
        db.add(course)
        db.commit()
        db.refresh(course)
        cur_course_id = course.id

    # After updating the course, update passed in nodes
    for node in nodes:
        existing_node = None
        if existing_course and node.id:
            existing_node = db.exec(select(Node).where(Node.id == node.id)).first()

        if existing_node:
            existing_node = db.exec(select(Node).where(Node.id == node.id)).first()
            existing_node.course_id = cur_course_id
            existing_node.title = node.title
            existing_node.short_description = node.short_description
            existing_node.tags = node.tags
            existing_node.videos = node.videos
            existing_node.rich_text_files = node.rich_text_files
            existing_node.uploaded_files = node.uploaded_files
            existing_node.third_party_resources = node.third_party_resources
            existing_node.parents = node.parents
            # TODO: Also need to handle changes in parents/children lists
            db.add(existing_node)
            db.commit()
            db.refresh(existing_node)
        else:
            node.id = None
            node.course_id = cur_course_id
            db.add(node)
            db.commit()
            db.refresh(node)

    ret_course = db.exec(select(Course).where(Course.id == cur_course_id)).first()
    ret_course.nodes = nodes
    return UpdatedCourse(course=ret_course, nodes=ret_course.nodes)


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
            id=node.id,
            title=node.title,
            short_description=node.short_description,
            parent_nodes=node.parents,
            complete=(node.id in user.node_progress.keys()) and
                (node.videos is not None and set([file.id for file in node.videos]).issubset(set(user.node_progress[node.id]))) and 
                (node.rich_text_files is not None and set([file.id for file in node.rich_text_files]).issubset(set(user.node_progress[node.id]))) and
                (node.uploaded_files is not None and set([file.id for file in node.uploaded_files]).issubset(set(user.node_progress[node.id]))) and
                (node.third_party_resources is not None and set([file.id for file in node.third_party_resources]).issubset(set(user.node_progress[node.id]))),
            tags=node.tags,
            content_types=[key for key in ["videos", "rich_text_files", "uploaded_files", "third_party_resources"] if node.model_dump().get(key) is not None] # We will need to update this listing with new content types as we add more support for them. Maybe this can be turned into a setting somehow?
        ) for node in course_nodes
    ]
    return node_overview
