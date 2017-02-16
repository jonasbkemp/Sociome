#!/bin/bash


wget https://github.com/ArnholdInstitute/Sociome-Data/raw/master/master.sql

createdb sociome

cat master.sql | psql sociome

rm master.sql