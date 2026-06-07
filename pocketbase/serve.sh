#!/bin/bash

cd "$(dirname "$0")"

./backend serve --http=0.0.0.0:8090 --origins=https://vizcoachs.netlify.app,https://vizcoach-api.duckdns.org,http://localhost:3000
