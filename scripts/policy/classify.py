#!/usr/bin/env python

from __future__ import unicode_literals

import glob
import pdb
import xlrd  #Excel file reader
import os
import sys
import re
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument('--file', type=str, help='process a particular file', default=None)
args = parser.parse_args()

# If no data, then download it...
if len(glob.glob('data/*.xls')) == 0:
	download_xls.downloadAll()

files = glob.glob('data/*.xls') if args.file is None else [args.file]

mdStream = open('docs/legends.md', 'w')
mdStream.write('Policy Field Descriptions\n')
mdStream.write('-------------------------\n\n')
mdStream.write('|Table|Col|Value|Desc|full|\n')
mdStream.write('|-----|---|-----|----|----|\n')


# Sheet names are not uniformly named...
def getSheet(wb):
	try:
		return wb.sheet_by_name('Data')
	except xlrd.XLRDError as e:
		try:
			return wb.sheet_by_name('general') # k_lic_15
		except xlrd.XLRDError as e:
			return wb.sheet_by_name('data')

r1 = re.compile(' *([0-9]+\.?[0-9]*) *if *(.+) *')
r2 = re.compile(' *([0-9]+\.?[0-9]*) *= *(.+) *')
r3 = re.compile(' *=([0-9]+\.?[0-9]*) *if *(.+) *')
r4 = re.compile(' *(.+) *= *([0-9]+\.?[0-9]*)')

def match(enum):
	if r1.match(enum):
		return r1.match(enum).groups()
	elif r2.match(enum):
		return r2.match(enum).groups()
	elif r3.match(enum):
		return r3.match(enum).groups()
	elif r4.match(enum):
		temp = r4.match(enum).groups()
		return (temp[1], temp[0])
	return None

jsonFile = {}

def parseEnumCol(desc, col, tableName):
	def write(arg):
		value=arg[0]
		key=arg[1]
		elt = {'desc' : key, 'value' : value, 'full' : desc.value}
		if tableName in jsonFile:
			if col.value in jsonFile[tableName]:
				jsonFile[tableName][col.value].append(elt)
			else:
				jsonFile[tableName][col.value] = [elt]
		else:
			jsonFile[tableName] = {col.value : [elt]}
		mdStream.write((u'|%s|%s|%s|%s|%s|\n' % (tableName, col.value, value, key, desc.value)).encode('utf-8'))
	parens = re.search('\([^\(]*\)', desc.value)
	if parens is not None:
		parens = parens.group(0)
		parens = parens[1:len(parens)-1]
		enums = []
		for item in parens.split(','):
			res = match(item)
			if res:
				enums.append(res)
		if len(enums) > 1:
			map(write, enums)

scriptStream = open('script.txt', 'w')
scriptStream.write('DROP TABLE IF EXISTS policy_descriptions;\n')
scriptStream.write('CREATE TABLE policy_descriptions (tablename text, field text, description text, enums json);\n')
scriptStream.write('COPY policy_descriptions (tablename, field, description, enums) FROM stdin;\n')
descriptions = []

def dbScript(desc, col, tableName):
	parens = re.search('\([^\(]*\)', desc.value)

	if parens is not None:
		parens = parens.group(0)
		parens = parens[1:len(parens)-1]
		parens = parens.replace('"', '\\\\"')
		enums = []
		for item in parens.split(','):
			res = match(item)
			if res:
				enums.append('{"val" : %s, "desc" : "%s"}' % (res[0], res[1]))
		description = re.sub('\(.*\)', '', desc.value) if len(enums) > 0 else desc.value
		scriptStream.write(('%s\t%s\t%s\t%s\n' % (tableName, col.value, description, '[%s]' % ','.join(enums))).encode('utf-8'))

for file in files:
	print('Processing %s' % file)
	tableName = os.path.splitext(os.path.basename(file))[0]
	wb = xlrd.open_workbook(file)
	data = getSheet(wb)
	[parseEnumCol(x[0], x[1], tableName) for x in zip(data.row(0), data.row(1))]
	[dbScript(x[0], x[1], tableName) for x in zip(data.row(0), data.row(1))]

scriptStream.write('\\.\n')

json.dump(jsonFile, open('./docs.json', 'w'))


