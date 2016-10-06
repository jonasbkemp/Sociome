#!/usr/bin/env python

import csv, pdb, numpy, os, re, math, sys, pandas, argparse

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=str, help='Output file')
args = parser.parse_args()

def buildMask(f, headers):
	cols = []
	for i in range(len(headers)):
		if f(headers[i]):
			cols.append(headers[i])
	return cols

def valToString(v):
	if v is None:
		return 'NULL'
	if type(v) is numpy.float64 or type(v) is float:
		if math.isnan(v):
			return 'NULL'
		elif math.isinf(v):
			return '0' # Some parts of Alaska have a pop of 0.  Percentages should also be 0
		else:
			return str(v)
	elif type(v) is numpy.int64 or type(v) is int:
		return str(v)
	elif type(v) is str:
		return v
	else:
		pdb.set_trace()
		raise Exception("Unexpected type")

def processYear(y):
	if type(y) == str and '-' in y:
		years = y.split('-')
		year = (int(years[0]) + int(years[1])) / 2
		return int(year)
	else:
		return int(y)	;

def pgType(v):
	if v.name == 'int64':
		return 'int'
	elif v.name == 'float64':
		return 'real'
	elif v.name == 'object':
		return 'text'
	else:
		raise "Unexpected type!"

def main(outStream):
	data = pandas.read_csv('data/PopDemographicsData.csv')

	yearMask = data['Year'].apply(lambda x: '-' in x)
	data['Year'] = data['Year'].apply(processYear)

	schema = [data[header].dtype for header in data.columns]

	cols = [
		'FIPS',
		'Year',
		'State Name',
		'State Abbrev',
		'County Name',
		'County Name, State Abbrev',
		'FIPS State Code',
		'FIPS County Code',
		'Federal Region Code',
		'Census Region Code',
		'Census Region Name',
		'Census Division Code',
		'Census Division Name',
		'Population Estimate'
	]

	newDataset = data[cols]

	totalPop = data['Population Estimate']

	races = ['White', 'Wh Non-Hisp/Lat', 'Wh Hisp/Latino', 'Black/Afr Am', 'Am Ind/Alaska Nat', 'Asian', 'Nat Haw/Oth Pac Isl']
	genders = ['Male', 'Female']
	ages = ['< 15', '15-19', '20-24', '25-44', '45-64', '65+']

	# Aggregate races
	for race in races:
		cols = buildMask(lambda header : race in header, data.columns)
		newDataset['population_' + race] = data[cols].sum(axis=1) / totalPop * 100

	# Aggregate Age Distribution
	for age in ages:
		cols = buildMask(lambda header : ('Male ' + age) in header or ('Female ' + age) in header, data.columns)
		col_name = 'population_' + age.replace('< ', 'lt_').replace('-', '_to_').replace('+', '_plus')
		newDataset[col_name] = data[cols].sum(axis=1) / totalPop * 100
		
	# Aggregate Gender Distribution
	cols = buildMask(lambda header : 'Population Female' in header, data.columns)
	newDataset['population_female'] = data[cols].sum(axis=1) / totalPop * 100

	# Aggregate Income Distribution
	cols = buildMask(lambda header : 'Per Capita Income' in header, data.columns)
	newDataset['per_capita_income'] = data[cols].sum(axis=1) / totalPop * 100

	newDataset['median_household_income'] = data['Median  Household Income']

	newDataset['median_family_income'] = data['Median Family Income']

	newDataset['persons_in_poverty'] = data['% Persons in Poverty']

	newDataset['eligible_for_medicare'] = data['# Eligible for Medicare'] / totalPop * 100

	newDataset['receiving_foodstamps'] = data['Food Stamp/SNAP Recipient Estimate'] / totalPop * 100

	newDataset['females_divorced'] = data['% Females Divorced']

	newDataset['unemployment_rate'] = data['Unemployment Rate, 16+']

	types = [pgType(newDataset[header].dtype) for header in newDataset.columns]

	colNames = map(lambda x: re.sub('( |,|/|-)+', '_', x).lower(), newDataset.columns)

	schema = ','.join(map(lambda x: '%s %s' % (x[0], x[1]), zip(colNames, types)))


	outStream.write('DROP TABLE IF EXISTS demographics;\n')
	outStream.write('CREATE TABLE demographics (' + schema + ');\n')
	outStream.write('COPY demographics (' + ','.join(colNames) + ') FROM stdin WITH NULL AS \'NULL\';\n')

	def outputRow(row):
		outStream.write('\t'.join([valToString(x) for x in row]) + '\n')

	newDataset[:][~yearMask].apply(outputRow, axis=1)
	outStream.write('\\.\n')

	outStream.write('CREATE TABLE temp (' + schema + ');\n')
	outStream.write('COPY temp (' + ','.join(colNames) + ') FROM stdin WITH NULL AS \'NULL\';\n')

	newDataset[:][yearMask].apply(outputRow, axis=1)
	outStream.write('\\.\n')

	cols = ['median_family_income', 'females_divorced']

	for col in colNames:
		outStream.write('UPDATE demographics AS d SET ' + col + '=t.' + col + ' FROM temp as t WHERE ' + 
				   'd.year=t.year AND d.fips=t.fips;\n')

	outStream.write('DROP TABLE temp;')


if __name__ == '__main__':
	if args.output is None:
		main(sys.stdout)
	else:
		main(open(args.output, 'w'))

