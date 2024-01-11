#!/bin/bash

./setup.sh

cd backend
docker compose build
docker compose up &

cd ../frontend
# TODO: start frontend app
wait
