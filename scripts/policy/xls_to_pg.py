#!/usr/bin/env python

import glob, pdb, os, sys, argparse, re
import pandas as pd
from sqlalchemy import create_engine
from subprocess import check_output

engine = create_engine('postgresql://localhost:5432/sociome')

parser = argparse.ArgumentParser()
parser.add_argument('--file', type=str, help='process a particular file', default=None)
args = parser.parse_args()

# If no data, then download it...
if len(glob.glob('policy/*.xls')) == 0:
	check_output(['svn', 'co', 'https://github.com/ArnholdInstitute/Sociome-Data/trunk/policy'])

files = glob.glob('policy/*.xls*') if args.file is None else [args.file]

for file in files:
	print('Processing %s' % file)
	tableName = os.path.splitext(os.path.basename(file))[0]

	data = pd.read_excel(file, sheetname=0, skiprows=1)
	data.columns = map(lambda c: c.lower(), data.columns)

	for c in data.columns:
		if c == 'state':
			continue
		data[c] = pd.to_numeric(data[c], errors='coerce')


	metadata = pd.read_excel(file, sheetname=1)
	metadata.columns = map(lambda c: re.sub('( |\(|\))+', '_', c.strip().lower()), metadata.columns)

	data.to_sql(tableName, engine, index=False, if_exists='replace')
	metadata.to_sql(tableName + '_metadata', engine, index=False, if_exists='replace')

	engine.execute('ALTER TABLE %s ADD COLUMN statecode int' % tableName)
	engine.execute('ALTER TABLE %s ADD COLUMN countycode int' % tableName)

	engine.execute('UPDATE %s SET countycode=0' % tableName)
	engine.execute("""
	    UPDATE %s SET statecode=statecodes.statecode 
	    FROM statecodes 
	    WHERE 
	        statecodes.county=%s.state AND 
	        statecodes.countycode=0;
	""" % (tableName, tableName))





