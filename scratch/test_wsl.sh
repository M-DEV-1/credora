#!/bin/sh
REPO_ROOT=$(git rev-parse --show-toplevel)
echo "REPO_ROOT: $REPO_ROOT"
WSL_PATH=$(wsl wslpath -u "$REPO_ROOT")
echo "WSL_PATH: $WSL_PATH"
