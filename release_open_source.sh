#!/bin/bash
set -e

COMMIT_MSG=$1
if [ -z "$COMMIT_MSG" ]; then
    echo "Please provide a commit message."
    exit 1
fi

TAG=$(git describe --tags | grep open-source)
if [ -z "$TAG" ]; then
    echo "No open-source tag found. Please tag the commit with open-source."
    exit 1
fi

echo "Found tag: $TAG"

NUM_COMMITS_BEHIND=$(echo $TAG | sed -n 's/^open-source-\([0-9]*\)-.*$/\1/p')
echo "Number of commits behind: $NUM_COMMITS_BEHIND"

if [ "$NUM_COMMITS_BEHIND" -eq "0" ]; then
    echo "No commits behind. Nothing to do."
    exit 0
fi

git reset "HEAD~$NUM_COMMITS_BEHIND"
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