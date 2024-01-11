from sqlalchemy import Integer, String, Column, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from services.config_service import Base

class User(Base):
    __tablename__ = 'User'
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    first_name = Column(String)
    last_name = Column(String)
    email_address = Column(String)
    password = Column(String)