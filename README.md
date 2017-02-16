Sociome
--------
[![Build Status](https://travis-ci.org/ArnholdInstitute/Sociome.svg?branch=master)](https://travis-ci.org/ArnholdInstitute/Sociome)
[![codecov](https://codecov.io/gh/ArnholdInstitute/Sociome/branch/master/graph/badge.svg)](https://codecov.io/gh/ArnholdInstitute/Sociome)
[![Dependency Status](https://gemnasium.com/badges/github.com/ArnholdInstitute/Sociome.svg)](https://gemnasium.com/github.com/ArnholdInstitute/Sociome)


Sociome is a tool for visualizing the relationship between major policy decisions and health outcomes

### Running with Docker

There are some tricky dependencies that we rely on that can make building difficult depending on the your system.  This repo contains a Docker container to relieve these issues.

Assuming you have installed [Docker](https://docs.docker.com/engine/installation/):

1. `docker pull ml9951/sociome`
2. `./run_docker.sh` (from `Sociome`)
3. Inside the docker container: `./create_db.sh`
4. `npm start`


### Native Build Instructions

This assumes you already have [Node.js installed](https://nodejs.org/en/download/)

1. Clone this repository `git clone https://github.com/ArnholdInstitute/Sociome.git`
2. `cd Sociome`
3. `npm install`
4. `npm run dev`
5. Open up `localhost:8080` in your web browser

You will also have to have created a PostgreSQL database called `sociome`.  A dump of the database can be found [here](https://github.com/ArnholdInstitute/Sociome-Data)
