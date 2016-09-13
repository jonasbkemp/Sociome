#!/usr/bin/env python

import csv, pdb, re, glob
import download_file

if len(glob.glob('data/*.csv')) == 0:
	download_file.downloadAll()


schema = [
	'int', 
	'int', 
	'int', 
	'text',
	'text', 
	'real', 
	'real', 
	'real',
	'real', 
	'real',
	'int', 
	'bool', 
	'bool'
]

def unicode_csv_reader(utf8_data, dialect=csv.excel, **kwargs):
    csv_reader = csv.reader(utf8_data, dialect=dialect, **kwargs)
    for row in csv_reader:
        yield [unicode(cell, 'latin-1') for cell in row]

scriptStream = open('script.txt', 'w')

def formatVal(v):
	if v == '':
		return 'NULL'
	return v.replace(',', '').encode('utf-8')

with open('data/2016CHR_CSV_Trend_Data.csv', 'rb') as csvfile:
    reader = unicode_csv_reader(csvfile)
    headers = reader.next()
    headers[0] = 'year' #change this from yearspan
    headers.remove('measurename')
    data = {}
    for row in reader:
    	row[1] = re.sub('[ |-]+', '_', row[1].lower())

    	# Empty measurename for some reason?
    	if row[1] == '':
    		continue;

    	if '-' in row[0]:
    		years = row[0].split('-')
    		year = (int(years[0]) + int(years[1])) / 2
    		row[0] = str(year)
    	s = row[0] + '\t' + '\t'.join(map(formatVal, row[2:]))
    	if row[1] in data:
			data[row[1]].append(s)
    	else:
    		data[row[1]] = [s]

    for key in data:
    	scriptStream.write('DROP TABLE IF EXISTS %s;\n' % key)
    	scriptStream.write('CREATE TABLE %s (%s);\n' % (key, ','.join(map(lambda x: '%s %s' % (x[0], x[1]), zip(headers, schema)))))
    	scriptStream.write('COPY %s (%s) FROM stdin WITH NULL AS \'NULL\';\n' % (key, ','.join(headers)))
    	keyData = data[key]
    	try:
    		scriptStream.write('\n'.join(keyData))
    	except Exception as e:
    		pdb.set_trace()
    	scriptStream.write('\n\\.\n')

