#!/usr/bin/env python


import pandas
import os
import glob
import json
import pdb
from subprocess import check_output

file='Sociome_Categorization_10.10.16.xlsx'

if not(os.path.exists(file)):
	check_output(['wget', 'https://github.com/ArnholdInstitute/Sociome-Data/raw/master/Sociome_Categorization_10.10.16.xlsx'])

data = pandas.read_excel(file)

if len(glob.glob('policy/*.xls*')) == 0:
	check_output(['svn', 'co', 'https://github.com/ArnholdInstitute/Sociome-Data/trunk/policy'])

tables = {}
for file in glob.glob('policy/*.xls*'):
	table = os.path.splitext(os.path.basename(file))[0]
	tables[table[0]] = table


categories = {}


def mkRec(r, table):
	return {
		'table' : table,
		'value' : r['Variable Code'],
		#'category' : r['New Category'],
		#'subcategory' : r['New Subcategory'],
		'label' : r['New Field Title']
	}

def outputRow(r):
	try:
		table = tables[r['Table Letter']]
		if r['New Category'] in categories:
			subcats = categories[r['New Category']]
			if r['New Subcategory'] in subcats:
				subcats[r['New Subcategory']].append(mkRec(r, table))
			else:
				subcats[r['New Subcategory']] = [mkRec(r, table)]
		else:
			categories[r['New Category']] = {
				r['New Subcategory'] : [mkRec(r, table)]
			}
	except Exception as e:
		pdb.set_trace()

data.apply(outputRow, axis=1)	

open('Categories.js', 'w').write('exports.categories = ' + json.dumps(categories, indent=2))

