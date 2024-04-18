import uuid

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from sqlmodel import select, Session
from starlette import status

from models.pydantic_models import RichText, ThirdPartyResource, UploadFile, Video
from models.db_models import Course, NodeParentLink, User, Node, NodeOverview
from models.dto_models import CourseFilters, CreateCourse, Edge, CreateCourseResponse, NodeProgressDetails
from services import auth_service, report_service
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

@router.post('/get/{course_id}', response_model=CreateCourseResponse, response_model_by_alias=False)
async def get_course(course_id: str, db: Session = Depends(get_session), user: User = Depends(auth_service.validate_token)):
    """
    Used by the course builder to initialize the view properly (we need more info than just get_node_overview provides for that page).
    """
    finalized_course = db.exec(select(Course).where(Course.id == course_id)).first()
    finalized_nodes = db.exec(select(Node).where(Node.course_id == course_id)).all()
    finalized_edges = []
    for node in finalized_nodes:
        for child in node.children:
            finalized_edges.append(Edge(source=str(node.id), target=str(child.id)))
    return CreateCourseResponse(course=finalized_course, nodes=finalized_nodes, edges=finalized_edges)

@router.post('/add_or_update', response_model=CreateCourseResponse, response_model_by_alias=False)
async def add_or_update_course(course: CreateCourse, db: Session = Depends(get_session), user: User = Depends(auth_service.validate_token)):
    # TODO: update this endpoint to only commit transaction after all parsing/uploading is done
    # this is mostly to ensure we don't upload half-baked data if assessment file parsing fails

    # Get reference to an existing course (if any)
    existing_course = db.exec(select(Course).where(Course.id == course.id)).first() if course.id else None

    if existing_course is None:
        # If existing_course is none then we are making a new course...
        existing_course = Course()
        existing_course.id = None
        existing_course.course_owner_id = user.id

    existing_course.title = course.title
    existing_course.short_description = course.short_description
    existing_course.is_published = course.is_published
    db.add(existing_course)
    db.commit()
    db.refresh(existing_course)
    cur_course_id = existing_course.id

    existing_node_ids = set([node.id for node in existing_course.nodes])

    # After updating the course, we create/update all the nodes, deleting any that are not found.
    # Also, put all the updated nodes within an array for later. 
    updated_nodes = []
    for node in course.nodes:
        new_assessment_file = None
        if node.assessment_file:
            try:
                new_assessment_file = report_service.parse_assessment_file(node.assessment_file)
            except Exception as e:
                print(f'Failed assessment upload: {str(e)}')
                pass # TODO: Convey to user that assessment failed to upload
        try:
            node_id = (uuid.UUID)(node.id)
        except:
            node_id = None
        if node_id is not None and node_id in existing_node_ids:
            existing_node = db.exec(select(Node).where(Node.id == node.id)).first()
            if existing_node:
                existing_node.course_id = cur_course_id
                existing_node.title = node.title
                existing_node.short_description = node.short_description
                existing_node.tags = node.tags

                # For each content type, we need to persist the id of the content.
                existing_node.videos = node.videos
                existing_node.rich_text_files = node.rich_text_files
                existing_node.uploaded_files = node.uploaded_files
                existing_node.third_party_resources = node.third_party_resources
                existing_node.assessment_file = new_assessment_file

                existing_node.parents = [] # Reset all edges
                db.add(existing_node)
                db.commit()
                db.refresh(existing_node)
                updated_nodes.append(existing_node)
        else:
            # Create new node
            new_node = Node(**node.model_dump(exclude={"id"}))
            new_node.assessment_file = new_assessment_file
            new_node.course_id = cur_course_id
            db.add(new_node)
            db.commit()
            db.refresh(new_node)
            updated_nodes.append(new_node)

    # Delete nodes that are not present in the passed-in course object
    for node in course.nodes:
        if node.id is not None:
            existing_node_ids.discard(uuid.UUID(node.id))
    for node_id in existing_node_ids:
        node_to_delete = db.exec(select(Node).where(Node.id == node_id)).first()
        if node_to_delete:
            db.delete(node_to_delete)
            db.commit()

    # Then we create/update all the links between parent/children.
    for edge in course.edges:
        child_node = updated_nodes[edge.target]
        parent_node = updated_nodes[edge.source]

        child_node.parents.append(parent_node)
        db.add(child_node)
        db.commit()
        db.refresh(child_node)

    # Return the created course
    finalized_course = db.exec(select(Course).where(Course.id == cur_course_id)).first()
    finalized_nodes = db.exec(select(Node).where(Node.course_id == cur_course_id)).all()
    finalized_edges = []
    for node in finalized_nodes:
        for child in node.children:
            finalized_edges.append(Edge(source=str(node.id), target=str(child.id)))
    return CreateCourseResponse(course=finalized_course, nodes=finalized_nodes, edges=finalized_edges)


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
            complete=node.id in user.node_progress,
            tags=node.tags,
            content_types=[key for key in ["videos", "rich_text_files", "uploaded_files", "third_party_resources"] if node.model_dump().get(key) is not None] # We will need to update this listing with new content types as we add more support for them. Maybe this can be turned into a setting somehow?
        ) for node in course_nodes
    ]
    return node_overview
