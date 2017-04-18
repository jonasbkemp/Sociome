#!/usr/bin/env python

import csv, pdb, re, glob, pandas, sys, os
from subprocess import check_output
from sqlalchemy import create_engine

engine = create_engine('postgresql://localhost:5432/sociome', encoding='latin1')

if not(os.path.exists('2016CHR_CSV_Trend_Data.csv')):
    url = 'https://github.com/ArnholdInstitute/Sociome-Data/raw/master/health_outcomes/2016CHR_CSV_Trend_Data.csv'
    check_output(['wget', '-O', '2016CHR_CSV_Trend_Data.csv', url])

def processYear(y):
    if type(y) == unicode and '-' in y:
        years = y.split('-')
        year = (int(years[0]) + int(years[1])) / 2
        return int(year)
    elif type(y) == float:
        return y
    else:
        return int(y)

data = pandas.read_csv('2016CHR_CSV_Trend_Data.csv', encoding='latin1')

data['yearspan'] = data['yearspan'].apply(processYear)

data = data.rename(index=str, columns={'yearspan' : 'year'})

data.to_sql('health_outcomes_temp', engine, index=False, if_exists='replace')

engine.execute('DROP TABLE IF EXISTS health_outcomes')
engine.execute('CREATE TABLE health_outcomes(year int, statecode int, countycode int, county text, state text);')
res = engine.execute('SELECT DISTINCT (lower(measurename)) FROM health_outcomes_temp WHERE measurename IS NOT NULL;')
for measure, in res:
    print('Processing %s' % measure)
    engine.execute("""
        CREATE TABLE temp AS (
            SELECT * FROM health_outcomes
            FULL OUTER JOIN (
                SELECT year, statecode, countycode, json_build_object(
                    'rawvalue', replace(rawvalue, ',', '')::float,
                    'cilow', replace(cilow, ',', '')::float,
                    'cihigh', replace(cihigh, ',', '')::float,
                    'measureid', measureid,
                    'differflag', differflag,
                    'trendbreak', trendbreak
                ) AS %(col_name)s FROM health_outcomes_temp
                    WHERE 
                        lower(measurename)='%(measurename)s' AND
                        rawvalue IS NOT NULL
            )s USING (year, statecode, countycode)
        )
    """ % {
        'measurename' : measure,
        'col_name' : re.sub('( |-)+', '_', measure)
    })
    engine.execute('DROP TABLE health_outcomes;')
    engine.execute('ALTER TABLE temp RENAME TO health_outcomes;')

engine.execute('DROP TABLE health_outcomes_temp;')

engine.execute("""
    UPDATE health_outcomes SET county=statecodes.county 
    FROM statecodes 
    WHERE health_outcomes.countycode=statecodes.countycode;
""")

engine.execute("""
    UPDATE health_outcomes SET state=statecodes.state 
    FROM statecodes 
    WHERE health_outcomes.statecode=statecodes.statecode;
""")