#!/bin/bash

if [ ! -f master.sql ]; then
	echo "Downloading Postgres dump..."
	wget https://github.com/ArnholdInstitute/Sociome-Data/raw/master/master.sql
fi

if [ -z $(psql -lqt | cut -d \| -f 1 | grep sociome) ]; then
	echo "Database doesn't exist, creating it now..."
	createdb sociome
	psql sociome -c "CREATE EXTENSION postgis;" 
fi

cat master.sql | psql sociome

rm master.sql