#!/usr/bin/env python

import csv, pdb, numpy, os, re, math, sys

def val(v):
	v = v.replace('"', '') if v is not None else v
	try:
		return int(v)
	except Exception as e:
		return v

def getHeaders():
	with open('data/EducationData.csv', 'rb') as csvfile:
	    reader = csv.reader(csvfile, delimiter=',')
	    return numpy.array(reader.next())


def processEducationData():
	with open('data/EducationData.csv', 'rb') as csvfile:
	    reader = csv.reader(csvfile, delimiter=',')
	    headers = reader.next()
	    data = list([] for x in headers)
	    for row in reader:
	    	years = row[1].split('-')
	    	year = (int(years[1]) + int(years[0]))/2
	    	row[1] = str(year);
	    	for i in range(len(row)):
	    		data[i].append(None if row[i] == '' else val(row[i]))
	    return numpy.array(data).transpose()

def buildMask(f, headers):
	mask = numpy.zeros((len(headers)), dtype=bool)
	for i in range(len(headers)):
		if f(headers[i]):
			mask[i] = True
	return mask

def addColumn(mask, data, newDataset, f):
	selection = data[:, mask].astype(numpy.float)
	aggregate = numpy.sum(selection, 1)
	try:
		aggregate = f(aggregate)
	except Exception:
		pdb.set_trace()
	return numpy.hstack((newDataset, aggregate[:, numpy.newaxis]))

def app(f, l):
	for i in range(len(l)):
		l[i] = f(l[i])

def determineType(v):
	try:
		int(v)
		return('int')
	except Exception:
		return 'text'

def valToString(v):
	if v is None:
		return 'NULL'
	if type(v) is float:
		if math.isnan(v):
			return 'NULL'
		elif math.isinf(v):
			return '0.0' # Some parts of Alaska have a pop of 0.  Percentages should also be 0
		else:
			return str(v)
	elif type(v) is int:
		return str(v)
	elif type(v) is str:
		return '$$' + v + '$$'
	else:
		pdb.set_trace()
		raise Exception("Unexpected type")

def main(outStream):
	if not(os.path.isfile('education.npy')):
		data = processEducationData()
		numpy.save('education', data)
	else:
		data = numpy.load('education.npy')
	headers = getHeaders()
	newDataset = data[:, 0:14]
	newHeaders = headers[0:14]

	# Convert titles to SQL friendly column names
	newHeaders = numpy.vectorize(lambda x: re.sub('( |,|\+)+', '_', x).lower())(newHeaders)
	schema = numpy.vectorize(determineType)(data[18, 0:14])

	#High school diploma or more
	mask = buildMask(lambda header: '% Persons 25+ W/HS Dipl Or More' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'hs_diploma_or_more_25_plus')
	schema = numpy.append(schema, 'real')

	#4+ years college
	mask = buildMask(lambda header: '% Persons 25+ W/4+ Yrs College' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'four_plus_years_college_25_plus')
	schema = numpy.append(schema, 'real')

	#< HS Diploma
	mask = buildMask(lambda header: '% Persons 25+ W/<HS Diploma' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'less_than_hs_diploma_25_plus')
	schema = numpy.append(schema, 'real')

	newHeaders = newHeaders.tolist()

	schema = map(lambda x: x[0] + ' ' + x[1], zip(newHeaders, schema.tolist()))

	outStream.write('CREATE TABLE education (' + ','.join(schema) + ');\n')
	outStream.write('COPY education (' + ','.join(newHeaders) + ') FROM stdin WITH NULL AS \'NULL\';\n')
	for i in range(data.shape[0]):
		outStream.write('\t'.join(map(lambda x: valToString(x), newDataset[i, :].tolist())) + '\n')
	outStream.write('\\.\n')	

	toAdd = ['hs_diploma_or_more_25_plus', 'four_plus_years_college_25_plus', 'less_than_hs_diploma_25_plus']
	for col in toAdd:
		outStream.write('ALTER TABLE demographics ADD COLUMN ' + col + ' real;\n')
		outStream.write('UPDATE demographics AS d SET ' + col + '=e.' + col + ' FROM education as e WHERE ' + 
			   'd.year=e.year AND d.FIPS=e.FIPS;\n')

	outStream.write('DROP TABLE education;\n')

if __name__ == '__main__':
    main(sys.stdout)


"""
Education column names:

'FIPS', 'Year', 'State Name', 'State Abbrev', 'County Name',
'County Name, State Abbrev', 'FIPS State Code', 'FIPS County Code',
'Federal Region Code', 'Census Region Code', 'Census Region Name',
'Census Division Code', 'Census Division Name', 'Persons 25+ Yrs',
'Persons 25+ Yrs W/<HS Diploma', 'Persons 25+ W/HS Dipl Or More',
'Persons 25+ W/4+ Yrs College', '% Persons 25+ W/<HS Diploma',
'% Persons 25+ W/HS Dipl Or More', '% Persons 25+ W/4+ Yrs College'
"""






















