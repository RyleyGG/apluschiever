from sqlalchemy import Integer, String, Column, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid

from sqlalchemy.orm import relationship

from services.config_service import Base


class User(Base):
    __tablename__ = 'User'
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    first_name = Column(String)
    last_name = Column(String)
    email_address = Column(String)
    password = Column(String)


class Course(Base):
    __tablename__ = 'Course'
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String)
    short_description = Column(String)
    course_owner_id = Column(UUID(as_uuid=True), ForeignKey('User.id'))
    course_owner = relationship("User")
    nodes = Column(JSON)
