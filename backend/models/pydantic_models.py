from sqlmodel import SQLModel


class Node(SQLModel, table=False):
    title: str
    short_description: str
