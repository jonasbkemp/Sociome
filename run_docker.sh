#!/bin/bash

# Check if we have the ml9951/sociome image locally
if [ -z $(docker images ml9951/sociome -q) ]; then
        docker pull ml9951/sociome
fi

# Check if there is an sociome container already created.
# If not, then run a new one
container=$(docker ps -a -f name=sociome --format "{{.ID}}")
if [ -z $container ]; then
        echo "No container found, starting new one..."
        docker run -p 8080:8080 --name sociome -w="/app" -v $(pwd):/app -it ml9951/sociome /bin/bash
else
        echo "Starting container $container"
        docker start $container
        echo "Attaching to container $container"
        docker attach $container
fi
