from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from db import getDb
from services.config_service import config
from services import auth_service
from routers import auth_router, user_router, course_router
from models.db_models import User as UserDb


app = FastAPI()
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

dbUrl = f'postgresql://postgres:{config.postgres_password}@db:5432/postgres'
engine = create_engine(
    dbUrl
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


@app.get("/")
async def root(user: UserDb = Depends(auth_service.validate_token)):
    return {'message': 'Hello World'}