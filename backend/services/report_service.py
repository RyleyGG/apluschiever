import os

import pandas as pd
from fastapi import HTTPException
from starlette import status
import base64

from models.pydantic_models import AssessmentFile, UploadFile, Question


def parse_assessment_file(file: UploadFile) -> AssessmentFile:
    # Preliminary validation
    if file.type != 'text/csv':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Incorrect assessment file type',
        )

    # Load data from base64
    file_name = f'temp_{file.name}'
    try:
        file_bytes = base64.b64decode(file.content)
        with open(file_name, 'wb') as f:
            f.write(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Unable to upload assessment file',
        )

    # Dynamically assign column names based on files column count
    try:
        with open(file_name, 'r') as f:
            first_line = f.readline()
            num_columns = len(first_line.split(','))
            column_labels = list('ABCDEFGHIJ')[:num_columns]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Error reading file: {str(e)}',
        )
    assessment_matrix = pd.read_csv(file_name, names=column_labels)

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
            # Column A: MC or MR string that denotes question type
            column_values = assessment_matrix[col]
            column_set = set(column_values)
            target_set = {'MC', 'MR'}
            if not column_set.issubset(target_set):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'Unexpected value(s) in column A. Expected values are MC or MR.',
                )
        if col_iter == 1:
            # Column B: Should be empty
            if not assessment_matrix[col].isna().all():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Unexpected value(s) in column B. Expected column to be blank',
                )
        elif col_iter == 2:
            # Column C: Check if point values are within the range and decimal places
            if not assessment_matrix[col].apply(
                    lambda x: isinstance(x, (int, float)) and 0 <= x <= 100 and len(str(x).rsplit('.')[-1]) <= 2).all():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Invalid point value in column C. Values must be between 0 and 100 with up to two decimal places.',
                )
        elif col_iter == 3:
            # Column D: Check if the question body is not empty
            if assessment_matrix[col].isna().any() or (assessment_matrix[col] == '').any():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Question body in column D cannot be blank.',
                )
        elif col_iter == 4:
            # Column E: Check if correct answers are correctly formatted and within range
            def is_valid_answer(value):
                try:
                    answers = value.split(',')
                    return all(int(answer.strip()) in range(1, 6) for answer in answers)
                except ValueError:
                    return False

            if not assessment_matrix[col].apply(is_valid_answer).all():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='Invalid answer index in column E. Each must be between 1 and 5, inclusive.',
                )
        elif 5 <= col_iter <= 9:
            # Columns F-J: Ensure at least two are filled
            if assessment_matrix.iloc[:, 5:10].isna().all(axis=1).any():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='At least two answer choices in columns F-J must be provided for each question.',
                )
        col_iter += 1

    # Parse data
    questions = []
    for index, row in assessment_matrix.iterrows():
        question_text = row['D']

        options = [opt for opt in row[['F', 'G', 'H', 'I', 'J']] if pd.notna(opt)]

        correct_answer_indices = [int(ans.strip()) - 1 for ans in str(row['E']).split(',')]
        answer = [options[idx] for idx in correct_answer_indices if len(options) > idx >= 0]

        question = Question(question_text=question_text, options=options, answer=answer)
        questions.append(question)
    assessment_file = AssessmentFile(name=file.name, questions=questions)

    os.remove(file_name)
    return assessment_file
