from enum import Enum
import uuid
from typing import List, Optional

from pydantic import Field
from sqlmodel import SQLModel
from sqlalchemy import LargeBinary, Column


class SupportedThirdParties(Enum):
    YOUTUBE = 'YouTube'

class Content(SQLModel, table=False):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4)

class Video(Content, table=False):
    embed_link: str
    video_source: SupportedThirdParties

class RichText(Content, table=False):
    content: str

class UploadFile(Content, table=False):
    name: str
    size: int
    type: str
    content: str # base 64 for content

class ThirdPartyResource(Content, table=False):
    embed_link: str
    #resource_source: SupportedThirdParties
