from enum import Enum
from pydantic import BaseModel, UUID4
from typing import Optional, List


class SignUpInfo(BaseModel):
    email_address: str
    first_name: str
    last_name: str
    password: str


class SignInInfo(BaseModel):
    email_address: str
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


class CourseFilters(BaseModel):
    ids: Optional[List[UUID4]] = None
    owned_by: Optional[List[UUID4]] = None
    course_title: Optional[str] = None


class NewCourse(BaseModel):
    title: str
    short_description: Optional[str] = None
    course_owner_id: UUID4


class UserType(Enum):
    STUDENT = 'Student'
    ADMIN = 'Administrator'
    TEACHER = 'Teacher'
