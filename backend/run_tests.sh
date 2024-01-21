#!/bin/bash

source ./backend/.venv/Scripts/activate
# auth_suite needs to run first so that an access token and user id are generated for later tests to utilize
pytest -vs tests/auth_suite.py tests/course_suite.py
