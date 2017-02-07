#!/usr/bin/env python


import psycopg2
import pdb
import sys

conn = psycopg2.connect(database='sociome')
cur = conn.cursor()

cur.execute('SELECT DISTINCT measurename FROM health_outcomes')

measures = cur.fetchall()

cur.execute('DROP TABLE IF EXISTS health_outcomes_pivot;')
cur.execute('CREATE TABLE health_outcomes_pivot(statecode int, countycode int, county text, state text, year int);')
cur.execute('ALTER TABLE health_outcomes_pivot ADD CONSTRAINT ho_constraint UNIQUE(statecode, countycode, year)')

for measure in measures:
    measure = measure[0]
    if measure is None:
        continue

    print(measure)
    cur.execute('ALTER TABLE health_outcomes_pivot ADD COLUMN "%s" real;' % measure)

    cur.execute("""
        UPDATE health_outcomes_pivot as p
        SET "%s"=h.rawvalue
        FROM health_outcomes as h
        WHERE 
            h.statecode=p.statecode AND
            h.countycode=p.countycode AND
            h.year=p.year AND
            h.measurename='%s'
    """ % (measure, measure))

    cur.execute("""
        INSERT INTO health_outcomes_pivot
        SELECT statecode, countycode, county, state, year, rawvalue as "%s"
        FROM health_outcomes as h
        WHERE measurename='%s'
        ON CONFLICT DO NOTHING
            
    """ % (measure, measure))

conn.commit()



