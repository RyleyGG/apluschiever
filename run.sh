#!/bin/bash

./setup.sh

cd backend
docker compose build
docker compose up &

cd ../frontend
ng serve --open
wait
