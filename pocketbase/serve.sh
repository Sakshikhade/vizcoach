#!/bin/bash

cd "$(dirname "$0")"

./backend serve --http=0.0.0.0:8090
