from typing import List

from sqlmodel import SQLModel


class Content(SQLModel, table=False):
    title: str


class Video(Content):
    embed_link: str
    video_source: str


class Markdown(Content):
    content: str
