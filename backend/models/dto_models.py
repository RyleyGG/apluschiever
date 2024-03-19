from enum import Enum
from pydantic import BaseModel, UUID4
from typing import Optional, List


class UserType(Enum):
    STUDENT = 'Student'
    ADMIN = 'Administrator'
    TEACHER = 'Teacher'


class SignUpInfo(BaseModel):
    email_address: str
    first_name: str
    last_name: str
    password: str
    user_type: Optional[str] = None


class SignInInfo(BaseModel):
    username: str
    password: str


class SuccessfulUserAuth(BaseModel):
    token_type: str
    access_token: str
    refresh_token: str
    user_id: UUID4


class RefreshToken(BaseModel):
    refresh_token: str


class UserFilters(BaseModel):
    ids: Optional[List[UUID4]] = None
    emails: Optional[List[str]] = None
    user_types: Optional[List[str]] = None


class CourseFilters(BaseModel):
    ids: Optional[List[UUID4]] = None
    owned_by: Optional[List[UUID4]] = None
    course_title: Optional[str] = None
    is_published: Optional[bool] = None


class NodeFilters(BaseModel):
    ids: Optional[List[UUID4]] = None
    course_ids: Optional[List[UUID4]] = None


class NewCourse(BaseModel):
    title: str
    short_description: Optional[str] = None
    course_owner_id: UUID4


class NodeProgressDetails(BaseModel):
    node_id: str
    completed_content: List[str]


class SupportedThirdParties(Enum):
    YOUTUBE = 'YouTube'


class NodeTags(Enum):
    CORE = 'Core'
    ASSESSMENT = 'Assessment'
    PRACTICE = 'Practice'
    SUPPLEMENTAL = 'Supplemental'