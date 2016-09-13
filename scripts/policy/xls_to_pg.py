#!/usr/bin/env python

import download_xls
import glob
import pdb
import xlrd  #Excel file reader
import os
import sys
import argparse

# This script generates a `.jsx` file to be included in the front end for
# Displaying the various fields in each table.
# Additionally, it generates a `script.txt` file that can be used to 
# population an SQL table, such as `cat script.txt | psql <db_name>

parser = argparse.ArgumentParser()
parser.add_argument('--file', type=str, help='process a particular file', default=None)
args = parser.parse_args()

# If no data, then download it...
if len(glob.glob('data/*.xls')) == 0:
	download_xls.downloadAll()

files = glob.glob('data/*.xls') if args.file is None else [args.file]

jsonFields = []

def addToJSONObj(data, name):
	labels = data.row(0)
	values = data.row(1)
	objs = map(lambda arg: '{label:%s,value:%s}' % (arg[0], arg[1]), zip(labels, values))
	jsonFields.append(name + ':[' + ','.join(objs) + ']')

# First unused cell type
# Source: http://www.lexicon.net/sjmachin/xlrd.html#xlrd.Cell-class
xlrd.XL_CELL_INT = 7

# Try and distinguish int/float/bool types, otherwise
# just return the type that xlrd gives the cell
def toType(cell):
	if cell.ctype == xlrd.XL_CELL_NUMBER:
		if(cell.value.is_integer()):
			if(cell.value == 0 or cell.value == 1):
				return xlrd.XL_CELL_BOOLEAN;
			return xlrd.XL_CELL_INT
	return cell.ctype


numberHeirarchy = [sys.maxint for x in range(xlrd.XL_CELL_INT+1)]
numberHeirarchy[xlrd.XL_CELL_BOOLEAN] = 0
numberHeirarchy[xlrd.XL_CELL_INT] = 1
numberHeirarchy[xlrd.XL_CELL_NUMBER] = 2

def joinTypes(t1, t2):
	if (t1 == t2):
		return t1
	elif t1 == xlrd.XL_CELL_EMPTY or t1 == xlrd.XL_CELL_ERROR or t1 == xlrd.XL_CELL_BLANK:
		return t2
	elif t2 == xlrd.XL_CELL_EMPTY or t2 == xlrd.XL_CELL_ERROR or t2 == xlrd.XL_CELL_BLANK:
		return t1
	elif t1 == xlrd.XL_CELL_TEXT or t2 == xlrd.XL_CELL_TEXT:
		return t1
	res = max(numberHeirarchy[t1], numberHeirarchy[t2])
	if res == sys.maxint:
		raise Exception("Error in joinTypes")
	return res;

# Sheet names are not uniformly named...
def getSheet(wb):
	try:
		return wb.sheet_by_name('Data')
	except xlrd.XLRDError as e:
		try:
			return wb.sheet_by_name('general') # k_lic_15
		except xlrd.XLRDError as e:
			return wb.sheet_by_name('data')

typeNames = ['text', 'text', 'real', 'real', 'bool', 'ERROR', 'text', 'int']

scriptStream = open('script.txt', 'w')

def cellToStr(cell):
	if cell.value == '':
		return 'NULL'
	if cell.value == '.' or cell.value == ' ':
		return '0'
	if cell.ctype == xlrd.XL_CELL_TEXT:
		return('%s' % cell.value)
	if cell.ctype == xlrd.XL_CELL_NUMBER and cell.value.is_integer():
		return str(int(cell.value))
	return str(cell.value)

def dumpValues(data):
	for i in range(2, data.nrows):
		row = map(cellToStr , data.row(i))
		scriptStream.write('\t'.join(row[0:data.ncols]) + '\n')
	scriptStream.write('\\.\n')

for file in files:
	print('Processing %s' % file)
	tableName = os.path.splitext(os.path.basename(file))[0]
	wb = xlrd.open_workbook(file)
	data = getSheet(wb)
	addToJSONObj(data, tableName)
	colTypes = [reduce(joinTypes, map(toType, data.col(i)[2:]), xlrd.XL_CELL_ERROR) for i in range(data.ncols)]
	colTypes = map(lambda ct: typeNames[ct], colTypes)
	colNames = map(lambda cell: cell.value.lower(), data.row(1))
	colNames = filter(lambda cn: cn != '', colNames) # Drop empty columns (s_marr_11)
	data.ncols = len(colNames)
	schema = ','.join(map(lambda arg: '%s %s' % (arg[0], arg[1]), zip(colNames, colTypes)))
	scriptStream.write('DROP TABLE IF EXISTS %s;\n' % tableName)
	scriptStream.write('CREATE TABLE %s (%s);\n' % (tableName, schema))
	scriptStream.write('COPY %s (%s) FROM stdin WITH NULL AS \'NULL\';\n' % (tableName, ','.join(colNames)))
	dumpValues(data)

open('PolicyFields.jsx', 'w').write('export const fields={' + ','.join(jsonFields) + '};')







