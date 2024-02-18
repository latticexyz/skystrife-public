#!/bin/bash
set -e

COMMIT_MSG=$1
if [ -z "$COMMIT_MSG" ]; then
    echo "Please provide a commit message."
    exit 1
fi

TAGGED_COMMIT=$(git rev-list -n 1 open-source)

git reset "$TAGGED_COMMIT"
git add .
git stash
git checkout open-source
git stash pop
git add .
git commit -m "$COMMIT_MSG"
git push public HEAD:main
git checkout main
git pull origin
git tag -d open-source
git tag open-source HEAD