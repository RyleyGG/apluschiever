from typing import Optional, List, Dict
import uuid

from pydantic import field_validator, BaseModel
from sqlalchemy import JSON, Column
from sqlmodel import SQLModel, Field, Relationship

from models.pydantic_models import Video, Markdown, UploadFile, ThirdPartyResource
from models.dto_models import UserType
from services.api_utility_service import pydantic_column_type


class User(SQLModel, table=True):
    __tablename__ = 'User'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    first_name: str
    last_name: str
    email_address: str
    password: str
    user_type: UserType
    owned_courses: Optional[List["Course"]] = Relationship(back_populates='course_owner')
    node_progress: Dict[uuid.UUID, List[uuid.UUID]] = Field(sa_column=Column(JSON), default={})  # Key-value of {Node ID: [Completed Content IDs]}


class NodeParentLink(SQLModel, table=True):
    __tablename__ = 'NodeParentLink'
    parent_id: uuid.UUID = Field(foreign_key="Node.id", primary_key=True)
    child_id: uuid.UUID = Field(foreign_key="Node.id", primary_key=True)


class Node(SQLModel, table=True):
    __tablename__ = 'Node'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str
    short_description: str
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[str]])))
    # SQLModel doesn't currently support polymorphism within attributes, meaning we can't have a generic abstract
    # Content class from which we actually use Video, Markdown, etc. classes when storing data.
    # Instead, we supply one attribute per content type we support.
    videos: Optional[List[Video]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[Video]])))
    markdown_files: Optional[List[Markdown]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[Markdown]])))
    uploaded_files: Optional[List[UploadFile]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[UploadFile]])))
    third_party_resources: Optional[List[ThirdPartyResource]] = Field(default=None, sa_column=Column(pydantic_column_type(Optional[List[ThirdPartyResource]])))
    course_id: uuid.UUID = Field(foreign_key='Course.id')
    course: Optional["Course"] = Relationship(back_populates="nodes")
    parents: List["Node"] = Relationship(
        back_populates="children",
        link_model=NodeParentLink,
        sa_relationship_kwargs=dict(
            primaryjoin="Node.id==NodeParentLink.child_id",
            secondaryjoin="Node.id==NodeParentLink.parent_id",
        ),
    )
    children: List["Node"] = Relationship(
        back_populates="parents",
        link_model=NodeParentLink,
        sa_relationship_kwargs=dict(
            primaryjoin="Node.id==NodeParentLink.parent_id",
            secondaryjoin="Node.id==NodeParentLink.child_id",
        ),
    )


# DTO models that have to be defined here because they rely on Node and therefore must init after
class NodeOverview(BaseModel):
    id: uuid.UUID
    title: str
    short_description: str
    parent_nodes: List["Node"]
    complete: bool
    tags: List[str]
    content_types: List[str]


class Course(SQLModel, table=True):
    __tablename__ = 'Course'
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    title: str = Field(nullable=False)
    short_description: Optional[str]
    course_owner_id: uuid.UUID = Field(foreign_key='User.id')
    course_owner: User = Relationship(back_populates='owned_courses')
    nodes: Optional[List[Node]] = Relationship(back_populates="course")
