from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from services import auth_service
from routers import auth_router, user_router, course_router
from models.db_models import User, Course
from services.api_utility_service import engine


@asynccontextmanager
async def on_startup(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=on_startup)
app.include_router(auth_router.router, prefix='/auth')
app.include_router(user_router.router, prefix='/user', dependencies=[Depends(auth_service.validate_token)])
app.include_router(course_router.router, prefix='/course', dependencies=[Depends(auth_service.validate_token)])

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root(user: User = Depends(auth_service.validate_token)):
    return {'message': 'Hello World'}