#!/bin/bash

pg_isready -h localhost -p 5432

if [ $? -ne 0 ]; then
        echo "starting Postgres server..."
        /etc/init.d/postgresql start
fi

pg_isready -h localhost -p 5432
while [ $? -ne 0 ]; do
        echo "Waiting for postgres to start..."
        sleep 1
        /etc/init.d/postgresql start
        pg_isready -h localhost -p 5432
done

sudo -u postgres psql -c "CREATE USER root WITH SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS PASSWORD 'root';"

sudo -u postgres createdb root

./create_db.sh

npm run build

npm start