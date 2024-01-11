from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from services.config_service import config

from services.config_service import config
from models.db_models import User as UserDb


app = FastAPI()
# Template for adding router:
# app.include_router(some_router.router, prefix='/some_router')

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

# Template for adding authentication to FastAPI endpoint:
# @app.get("/")
# async def root(user: UserDb = Depends(auth_service.validateToken)):
#     return {'message': 'Hello World'}

@app.get("/")
async def root():
    return {'message': 'Hello World'}