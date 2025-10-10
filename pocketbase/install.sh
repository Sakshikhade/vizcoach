#!/bin/bash

cd "$(dirname "$0")"

go mod init backend
go mod tidy
