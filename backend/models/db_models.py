from typing import Optional, List
import uuid

from pydantic import field_validator
from sqlalchemy import JSON, Column
from sqlmodel import SQLModel, Field, Relationship

from models.pydantic_models import Content
from services.api_utility_service import pydantic_column_type


class User(SQLModel, table=True):
    __tablename__ = 'User'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    first_name: str
    last_name: str
    email_address: str
    password: str
    # courses that the user owns, NOT courses they've participated in
    courses: Optional[List["Course"]] = Relationship(back_populates='course_owner')


class NodeCourseAssociation(SQLModel, table=True):
    node_id: uuid.UUID = Field(default=None, foreign_key="Node.id", primary_key=True)
    course_id: uuid.UUID = Field(default=None, foreign_key="Course.id", primary_key=True)


class Node(SQLModel, table=True):
    __tablename__ = 'Node'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str
    short_description: str
    content: Optional[List[Content]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[Content]])))
    courses: List["Course"] = Relationship(back_populates="nodes", link_model=NodeCourseAssociation)


class Course(SQLModel, table=True):
    __tablename__ = 'Course'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str = Field(nullable=False)
    short_description: Optional[str]
    course_owner_id: uuid.UUID = Field(foreign_key='User.id')
    course_owner: User = Relationship(back_populates='courses')
    nodes: List[Node] = Relationship(back_populates="courses", link_model=NodeCourseAssociation)
