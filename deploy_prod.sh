#!/bin/bash
set -euo pipefail

source ./server/.env

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "master" ]]; then
  echo 'Branch is not on master, aborting';
  exit 1;
fi

LATEST_SHA=$(git rev-parse HEAD | cut -c 1-8)

while true; do
  read -p "Do you want to deploy git SHA ${LATEST_SHA} y/n?" yn
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer Y/y N/n.";;
  esac
done

echo "Building the containers..."
docker build -f ./server/Dockerfile.prod --build-arg LATEST_SHA=$LATEST_SHA -t us.gcr.io/$GOOGLE_CLOUD_PROJECT/wager-server:$LATEST_SHA ./server/.
docker build -f ./client/Dockerfile.prod --build-arg LATEST_SHA=$LATEST_SHA -t us.gcr.io/$GOOGLE_CLOUD_PROJECT/wager-client:$LATEST_SHA ./client/.

echo "Pushing the containers up to GCR..."
docker push us.gcr.io/$GOOGLE_CLOUD_PROJECT/wager-server:$LATEST_SHA
docker push us.gcr.io/$GOOGLE_CLOUD_PROJECT/wager-client:$LATEST_SHA

echo "done!"
