#!/usr/bin/env python

import csv, pdb, re, glob
import download_file
import pandas, sys

if len(glob.glob('data/*.csv')) == 0:
	download_file.downloadAll()


schema = [
	'text', #yearspan
	'text', #measurename
    'int', #statecode
    'int', #countycode
	'text', #county
    'text', #state
	'real', #numerator
	'real', #denominator
	'real', #rawvalue
	'real', #cilow
	'real', #cihigh
	'int', #measureid
	'bool', #differflag
	'bool',#trendbreak
    'int'  #year column
]

scriptStream = open('script.txt', 'w')


def castToInt(v, field):
    v[field] = v[field] if pandas.isnull(v[field]) else int(v[field])

def formatVal(v):
    v['measureid'] = v['measureid'] if pandas.isnull(v['measureid']) else int(v['measureid']) 
    castToInt(v, 'measureid')
    castToInt(v, 'differflag')
    castToInt(v, 'trendbreak')
    scriptStream.write('\t'.join([str(v) for v in v.values]) + '\n')

data = pandas.read_csv('data/2016CHR_CSV_Trend_Data.csv')

def midYear(ystr):
    if type(ystr) is str:
        rangeY = ystr.split('-')
        return str((int(rangeY[0]) + int(rangeY[1])) / 2) if len(rangeY) > 1 else ystr
    else:
        return ystr

data['year'] = data['yearspan'].apply(midYear)
data['rawvalue'] = data['rawvalue'].apply(lambda x: x.replace(',', '') if type(x) is str else x)
data['cilow'] = data['cilow'].apply(lambda x: x.replace(',', '') if type(x) is str else x)
data['cihigh'] = data['cihigh'].apply(lambda x: x.replace(',', '') if type(x) is str else x)


schema = ','.join('%s %s' % (x[0], x[1]) for x in zip(data.columns, schema))

scriptStream.write('SET CLIENT_ENCODING TO LATIN1;\n')
scriptStream.write('DROP TABLE IF EXISTS health_outcomes;\n')
scriptStream.write('CREATE TABLE health_outcomes (%s);\n' % schema)
scriptStream.write('COPY health_outcomes (%s) FROM stdin WITH NULL AS \'nan\';\n' % (','.join(data.columns)))

data.apply(formatVal, axis=1)

scriptStream.write('\\.\n')
scriptStream.write('UPDATE health_outcomes SET measurename=initcap(lower(measurename));')
scriptStream.write('CREATE INDEX measurename ON health_outcomes (measurename);\n')



