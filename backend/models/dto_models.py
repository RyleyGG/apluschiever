from pydantic import BaseModel, UUID4
from typing import Optional, List

from models.db_models import Course, Node, NodeParentLink
from models.pydantic_models import RichText, ThirdPartyResource, UploadFile, Video

#region Authentication DTO Models


class SignUpInfo(BaseModel):
    """
    Used to register a new user. Holds all information necessary to create a new user.
    """
    email_address: str
    first_name: str
    last_name: str
    password: str
    user_type: Optional[str] = None


class SignInInfo(BaseModel):
    """
    Used to sign in a user. 
    """
    username: str
    password: str


class SuccessfulUserAuth(BaseModel):
    """
    Represents the OAuth2 data that is generated upon successful login.
    """
    token_type: str
    access_token: str
    refresh_token: str
    user_id: UUID4


class RefreshToken(BaseModel):
    """
    A OAuth2 refresh token.
    """
    refresh_token: str

#endregion 

#region Filter DTO Models


class UserFilters(BaseModel):
    """
    Used to make filter queries on users. 
    """
    ids: Optional[List[UUID4]] = None
    emails: Optional[List[str]] = None
    user_types: Optional[List[str]] = None


class CourseFilters(BaseModel):
    """
    Used to make filter queries on courses. 
    """
    ids: Optional[List[UUID4]] = None
    owned_by: Optional[List[UUID4]] = None
    course_title: Optional[str] = None
    is_published: Optional[bool] = None


class NodeFilters(BaseModel):    
    """
    Used to make filter queries on nodes. 
    """
    ids: Optional[List[UUID4]] = None
    course_ids: Optional[List[UUID4]] = None

#endregion 

#region Course Creation/Updating DTO Models


class CreateNode(BaseModel): 
    """
    A model used only within the CreateCourse model. This holds all the information
    necessary to create a node within the course that is being created. 
    """
    id: Optional[str] = None # We will convert to UUID if present, otherwise generate a UUID
    title: str
    short_description: Optional[str] = []
    tags: Optional[List[str]] = []

    # Content uploads
    videos: Optional[List[Video]] = []
    rich_text_files: Optional[List[RichText]] = []
    uploaded_files: Optional[List[UploadFile]] = []
    third_party_resources: Optional[List[ThirdPartyResource]] = []
    # Should be UploadFile NOT AssessmentFile here because the backend needs to parse first
    assessment_file: Optional[UploadFile] = None

    # We will grab courseID from the CreateCourse that this is sent from
    # We will generate the parents/children list based on the CreateEdge model below 


class CreateEdge(BaseModel):
    """'
    A model used only within the CreateCourse model. This holds all the information
    necessary to create an edge within the course that is being created. 
    """
    source: int # index of the node within the nodes List of the CreateCourse to act as the parent
    target: int # index of the node within the nodes List of the CreateCourse to act as the child


class CreateCourse(BaseModel):
    """
    A model that holds all information necessary to Create a new Course.
    """
    id: Optional[UUID4] = None
    title: str
    short_description: Optional[str] = None

    course_owner_id: Optional[UUID4] = None
    is_published: bool

    nodes: Optional[List[CreateNode]] = []
    edges: Optional[List[CreateEdge]] = []


class Edge(BaseModel):
    source: str
    target: str


class CreateCourseResponse(BaseModel):
    course: Course
    nodes: Optional[List[Node]] = None
    edges: Optional[List[Edge]] = None

#endregion


class NodeProgressDetails(BaseModel):
    node_id: str
    completed_content: List[str]
