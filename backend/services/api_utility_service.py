import json
from typing import Generic, T

from fastapi.encoders import jsonable_encoder
from pydantic import parse_obj_as, TypeAdapter
from pydantic.v1.main import ModelMetaclass
from sqlalchemy import TypeDecorator, JSON
from sqlmodel import Session, create_engine

from services.config_service import config


dbUrl = f'postgresql://postgres:{config.postgres_password}@db:5432/postgres'
engine = create_engine(dbUrl)


def get_session():
    with Session(engine) as session:
        yield session


# This method borrowed from Maximilian Franz
# Code located here: https://github.com/tiangolo/sqlmodel/issues/63
def pydantic_column_type(pydantic_type):
    class PydanticJSONType(TypeDecorator, Generic[T]):
        impl = JSON()

        def __init__(
            self, json_encoder=json,
        ):
            self.json_encoder = json_encoder
            super(PydanticJSONType, self).__init__()

        def bind_processor(self, dialect):
            impl_processor = self.impl.bind_processor(dialect)
            dumps = self.json_encoder.dumps
            if impl_processor:

                def process(value: T):
                    if value is not None:
                        if isinstance(pydantic_type, ModelMetaclass):
                            # This allows to assign non-InDB models and if they're
                            # compatible, they're directly parsed into the InDB
                            # representation, thus hiding the implementation in the
                            # background. However, the InDB model will still be returned
                            value_to_dump = pydantic_type.from_orm(value)
                        else:
                            value_to_dump = value
                        value = jsonable_encoder(value_to_dump)
                    return impl_processor(value)

            else:

                def process(value):
                    if isinstance(pydantic_type, ModelMetaclass):
                        # This allows to assign non-InDB models and if they're
                        # compatible, they're directly parsed into the InDB
                        # representation, thus hiding the implementation in the
                        # background. However, the InDB model will still be returned
                        value_to_dump = pydantic_type.from_orm(value)
                    else:
                        value_to_dump = value
                    value = dumps(jsonable_encoder(value_to_dump))
                    return value

            return process

        def result_processor(self, dialect, coltype) -> T:
            impl_processor = self.impl.result_processor(dialect, coltype)
            if impl_processor:

                def process(value):
                    value = impl_processor(value)
                    if value is None:
                        return None

                    data = value
                    # Explicitly use the generic directly, not type(T)
                    full_obj = parse_obj_as(pydantic_type, data)
                    return full_obj

            else:
                def process(value):
                    if value is None:
                        return None

                    # Explicitly use the generic directly, not type(T)
                    full_obj = parse_obj_as(pydantic_type, value)
                    return full_obj

            return process

        def compare_values(self, x, y):
            return x == y

    return PydanticJSONType
