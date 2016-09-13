#!/usr/bin/env python

import csv, pdb, numpy, os, re, math, sys

def val(v):
	v = v.replace('"', '') if v is not None else v
	try:
		return int(v)
	except Exception as e:
		return v

def getHeaders():
	with open('data/PopDemographicsData.csv', 'rb') as csvfile:
	    reader = csv.reader(csvfile, delimiter=',')
	    return numpy.array(reader.next())


def processDemographicsData():
	with open('data/PopDemographicsData.csv', 'rb') as csvfile:
	    reader = csv.reader(csvfile, delimiter=',')
	    headers = reader.next()
	    data = list([] for x in headers)
	    for row in reader:
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
			return '0' # Some parts of Alaska have a pop of 0.  Percentages should also be 0
		else:
			return str(v)
	elif type(v) is int:
		return str(v)
	elif type(v) is str:
		return v
	else:
		pdb.set_trace()
		raise Exception("Unexpected type")

def main(outStream):
	if not(os.path.isfile('pop_demographics.npy')):
		data = processDemographicsData()
		numpy.save('pop_demographics', data)
	else:
		data = numpy.load('pop_demographics.npy')
	headers = getHeaders()

	newDataset = data[:, 0:14]
	newHeaders = headers[0:14]

	# Convert titles to SQL friendly column names
	newHeaders = numpy.vectorize(lambda x: re.sub('( |,)+', '_', x).lower())(newHeaders)
	schema = numpy.vectorize(determineType)(data[18, 0:14])

	totalPop = data[:, buildMask(lambda header : 'Population Estimate' in header, headers)].astype(numpy.float)
	totalPop = numpy.ndarray.flatten(totalPop)

	races = ['White', 'Wh Non-Hisp/Lat', 'Wh Hisp/Latino', 'Black/Afr Am', 'Am Ind/Alaska Nat', 'Asian', 'Nat Haw/Oth Pac Isl']
	genders = ['Male', 'Female']
	ages = ['< 15', '15-19', '20-24', '25-44', '45-64', '65+']

	# Aggregate races
	for race in races:
		mask = buildMask(lambda header : race in header, headers)
		newDataset = addColumn(mask, data, newDataset, lambda x: x / totalPop * 100)
		newHeaders = numpy.append(newHeaders, 'population_' + re.sub('( |/|-)', '_', race).lower())
		schema = numpy.append(schema, 'real')

	# Aggregate Age Distribution
	for age in ages:
		mask = buildMask(lambda header : ('Male ' + age) in header or ('Female ' + age) in header, headers)
		newDataset = addColumn(mask, data, newDataset, lambda x: x / totalPop * 100)
		col_name = 'population_' + age.replace('< ', 'lt_').replace('-', '_to_').replace('+', '_plus')
		newHeaders = numpy.append(newHeaders, col_name)
		schema = numpy.append(schema, 'real')
		
	# Aggregate Gender Distribution
	mask = buildMask(lambda header : 'Population Female' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x / totalPop * 100)
	newHeaders = numpy.append(newHeaders, 'population_female')
	schema = numpy.append(schema, 'real')

	# Aggregate Income Distribution
	mask = buildMask(lambda header: 'Per Capita Income' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'per_capita_income')
	schema = numpy.append(schema, 'real')

	mask = buildMask(lambda header: 'Median  Household' in header, headers)#Note two spaces
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'median_household_income')
	schema = numpy.append(schema, 'real')

	mask = buildMask(lambda header: 'Median Family Income' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'median_family_income')
	schema = numpy.append(schema, 'real')

	mask = buildMask(lambda header: '% Persons in Poverty' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'persons_in_poverty')
	schema = numpy.append(schema, 'real')

	# Aggregate Benefits
	mask = buildMask(lambda header: '# Eligible for Medicare' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x / totalPop * 100)
	newHeaders = numpy.append(newHeaders, 'elligible_for_medicare')
	schema = numpy.append(schema, 'real')

	mask = buildMask(lambda header: 'Food Stamp/SNAP Recipient Estimate' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x / totalPop * 100)
	newHeaders = numpy.append(newHeaders, 'receiving_foodstamps')
	schema = numpy.append(schema, 'real')

	# Aggregate Household Charactersistics
	mask = buildMask(lambda header: '% Females Divorced' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'females_divorced')
	schema = numpy.append(schema, 'real')

	# Aggregate Employment 
	mask = buildMask(lambda header: 'Unemployment Rate' in header, headers)
	newDataset = addColumn(mask, data, newDataset, lambda x: x)
	newHeaders = numpy.append(newHeaders, 'unemployment_rate')
	schema = numpy.append(schema, 'real')

	newHeaders = newHeaders.tolist()

	schema = map(lambda x: x[0] + ' ' + x[1], zip(newHeaders, schema.tolist()))

	outStream.write('DROP TABLE IF EXISTS demographics;\n')
	outStream.write('CREATE TABLE demographics (' + ','.join(schema) + ');\n')
	outStream.write('COPY demographics (' + ','.join(newHeaders) + ') FROM stdin WITH NULL AS \'NULL\';\n')
	for i in range(newDataset.shape[0]):
		if type(newDataset[i, 1]) == int or '-' not in newDataset[i, 1]:
			outStream.write('\t'.join(map(lambda x: valToString(x), newDataset[i, :].tolist())) + '\n')
	outStream.write('\\.\n')

if __name__ == '__main__':
    main(sys.stdout)



# Make sure that every row has the same number of columns	
def padData():
	outStream = open('data/PopDemographicsData.csv', 'w')
	with open('data/PopDemographicsData.csv', 'rb') as csvfile:
	    reader = csv.reader(csvfile, delimiter=',')
	    headers = reader.next()
	    app(lambda x: '"' + x + '"', headers)
	    outStream.write(','.join(headers) + '\n')
	    for row in reader:
	    	if '-' in row[1]:  #Skip the range of year rows
	    		continue
	    	row += [None] * (len(headers) - len(row))
	    	app(lambda x: '"' + x + '"', row)
	    	outStream.write(','.join(row) + '\n')

"""
Education column names:

'"FIPS"', '"Year"', '"State Name"', '"State Abbrev"', '"County Name"', '"County Name', ' State Abbrev"', 
'"FIPS State Code"', '"FIPS County Code"', '"Federal Region Code"', '"Census Region Code"', '"Census Region Name"', 
'"Census Division Code"', '"Census Division Name"', '"Population Estimate"', '"Population White Male < 15"', 
'"Population White Male 15-19"', '"Population White Male 20-24"', '"Population White Male 25-44"',
'"Population White Male 45-64"', '"Population White Male 65+"', '"Population White Female < 15"', 
'"Population White Female 15-19"', '"Population White Female 20-24"', '"Population White Female 25-44"',
'"Population White Female 45-64"', '"Population White Female 65+"', '"Population Wh Non-Hisp/Lat Male < 15"', 
'"Population Wh Non-Hisp/Lat Male 15-19"', '"Population Wh Non-Hisp/Lat Male 20-24"', 
'"Population Wh Non-Hisp/Lat Male 25-44"', '"Population Wh Non-Hisp/Lat Male 45-64"', '"Population Wh Non-Hisp/Lat Male 65+"',
'"Population Wh Non-Hisp/Lat Female < 15"', '"Population Wh Non-Hisp/Lat Female 15-19"',
'"Population Wh Non-Hisp/Lat Female 20-24"', '"Population Wh Non-Hisp/Lat Female 25-44"', 
'"Population Wh Non-Hisp/Lat Female 45-64"', '"Population Wh Non-Hisp/Lat Female 65+"', 
'"Population Wh Hisp/Latino Male < 15"', '"Population Wh Hisp/Latino Male 15-19"', 
'"Population Wh Hisp/Latino Male 20-24"', '"Population Wh Hisp/Latino Male 25-44"', 
'"Population Wh Hisp/Latino Male 45-64"', '"Population Wh Hisp/Latino Male 65+"', 
'"Population Wh Hisp/Latino Female < 15"', '"Population Wh Hisp/Latino Female 15-19"',
'"Population Wh Hisp/Latino Female 20-24"', '"Population Wh Hisp/Latino Female 25-44"', 
'"Population Wh Hisp/Latino Female 45-64"', '"Population Wh Hisp/Latino Female 65+"', 
'"Population Black/Afr Am Male < 15"', '"Population Black/Afr Am Male 15-19"', '"Population Black/Afr Am Male 20-24"', 
'"Population Black/Afr Am Male 25-44"', '"Population Black/Afr Am Male 45-64"', '"Population Black/Afr Am Male 65+"',
'"Population Black/Afr Am Female < 15"', '"Population Black/Afr Am Female 15-19"', '"Population Black/Afr Am Female 20-24"',
'"Population Black/Afr Am Female 25-44"', '"Population Black/Afr Am Female 45-64"', '"Population Black/Afr Am Female 65+"', 
'"Population Am Ind/Alaska Nat Male < 15"', '"Population Am Ind/Alaska Nat Male 15-19"',
'"Population Am Ind/Alaska Nat Male 20-24"', '"Population Am Ind/Alaska Nat Male 25-44"',
'"Population Am Ind/Alaska Nat Male 45-64"', '"Population Am Ind/Alaska Nat Male 65+"', 
'"Population Am Ind/Alaska Nat Femle < 15"', '"Population Am Ind/Alaska Nat Femle 15-19"',
'"Population Am Ind/Alaska Nat Femle 20-24"', '"Population Am Ind/Alaska Nat Femle 25-44"', 
'"Population Am Ind/Alaska Nat Femle 45-64"', '"Population Am Ind/Alaska Nat Femle 65+"',
'"Population Asian Male < 15"', '"Population Asian Male 15-19"', '"Population Asian Male 20-24"', 
'"Population Asian Male 25-44"', '"Population Asian Male 45-64"', '"Population Asian Male 65+"', 
'"Population Asian Female < 15"', '"Population Asian Female 15-19"', '"Population Asian Female 20-24"', 
'"Population Asian Female 25-44"', '"Population Asian Female 45-64"', '"Population Asian Female 65+"', 
'"Population Nat Haw/Oth Pac Isl Male < 15"', '"Population Nat Haw/Oth Pac Isl Male 15-19"',
'"Population Nat Haw/Oth Pac Isl Male 20-24"', '"Population Nat Haw/Oth Pac Isl Male 25-44"', 
'"Population Nat Haw/Oth Pac Isl Male 45-64"', '"Population Nat Haw/Oth Pac Isl Male 65+"', 
'"Population Nat Haw/Oth Pac Isl Fem < 15"', '"Population Nat Haw/Oth Pac Isl Fem 15-19"', 
'"Population Nat Haw/Oth Pac Isl Fem 20-24"', '"Population Nat Haw/Oth Pac Isl Fem 25-44"', 
'"Population Nat Haw/Oth Pac Isl Fem 45-64"', '"Population Nat Haw/Oth Pac Isl Fem 65+"', 
'"Population Male < 15"', '"Population Male 15-19"', '"Population Male 20-24"', '"Population Male 25-44"', 
'"Population Male 45-64"', '"Population Male 65+"', '"Population Female < 15"', '"Population Female 15-19"', 
'"Population Female 20-24"', '"Population Female 25-44"', '"Population Female 45-64"', '"Population Female 65+"',
'"# Eligible for Medicare"', '"Mdcr Enrollment', ' Aged Tot"', '"Medicaid Eligibles', ' Total"', 
'"Per Capita Income"', '"Median  Household Income"', '"Personal Inc (by res) (1000\'s)"', '"Median Family Income"',
'"% Persons in Poverty"', '"Unemployment Rate', ' 16+"', '"Civilian Labor Force', ' 16+"', 
'"Persons 25+ Yrs W/<HS Diploma"', '"Persons 25+ W/HS Dipl Or More"', '"Persons 25+ W/4+ Yrs College"', 
'"% Persons 25+ W/<HS Diploma"', '"% Persons 25+ W/4+ Yrs College"', '"Food Stamp/SNAP Recipient Estimate"',
'"% Females Divorced"'
"""






















