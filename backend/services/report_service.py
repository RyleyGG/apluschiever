import os

import pandas as pd
from fastapi import HTTPException
from starlette import status
import base64

from models.pydantic_models import AssessmentFile, UploadFile


def parse_assessment_file(file: UploadFile) -> AssessmentFile:
    # Preliminary validation
    if file.type != 'text/csv':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Incorrect assessment file type',
        )

    # Load data from base64
    file_name = f'temp_{file.name}.csv'
    try:
        file_bytes = base64.b64decode(file.content)
        with open(file_name, 'wb') as f:
            f.write(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Unable to upload assessment file',
        )
    assessment_matrix = pd.read_csv(file_name)

    # Verifying schema
    # Currently, we only support one schema - the CSV template that Kansas State
    # uses to convert CSVs to QTI files (standardized quiz files for Canvas)
    # https://dl.sps.northwestern.edu/canvas/2021/06/add-quiz-questions-to-canvas-by-converting-csv-files-to-qti-zip-files/

    if len(assessment_matrix.columns) < 7 or len(assessment_matrix.columns) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Incorrect assessment schema - excepted between 7 and 10 cols, received {len(assessment_matrix.columns)}',
        )


    col_iter = 0
    for col in assessment_matrix.columns:
        if col_iter == 0:
            column_values = assessment_matrix[col]
            column_set = set(column_values)
            target_set = {'MC', 'MR'}
            if not column_set.issubset(target_set):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'Unexpected value(s) in column A. Expected values are MC or MR.',
                )
        if col_iter == 1:
            print(assessment_matrix)
            print(assessment_matrix[col])
            column_values = assessment_matrix[col]
            column_set = set(column_values)
            target_set = {}
            if not column_set.issubset(target_set):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'Unexpected value(s) in column B. Expected column to be blank',
                )
        if col_iter == 2:
            print(assessment_matrix)
            print(assessment_matrix[col])
        col_iter += 1



    # TODO: Verify data

    # TODO: Parse data

    os.remove(file_name)
