#!/usr/bin/env python 

import pandas
import pdb
from sqlalchemy import create_engine
from subprocess import check_output
import os

if not(os.path.exists('aca_data.xlsx')):
    url='https://github.com/ArnholdInstitute/Sociome-Data/raw/master/aca/aca_data.xlsx'
    check_output(['wget', '-O', 'aca_data.xlsx', url])

engine = create_engine('postgresql://localhost:5432/sociome')

data = pandas.read_excel('./aca_data.xlsx', skiprows=1)
metadata = pandas.read_excel('./aca_data.xlsx', sheetname=1)

data = data.rename(index=str, columns={'State' : 'state', 'Year' : 'year'})

metadata.columns = ['variable_name', 'variable_code', 'source', 'link', 'access_date']

data.to_sql('aca', engine, index=False, if_exists='replace')
metadata.to_sql('aca_metadata', engine, index=False, if_exists='replace')

engine.execute('ALTER TABLE aca ADD COLUMN statecode int')
engine.execute('ALTER TABLE aca ADD COLUMN countycode int')

engine.execute('UPDATE aca SET countycode=0')
engine.execute("""
    UPDATE aca SET statecode=statecodes.statecode 
    FROM statecodes 
    WHERE 
        statecodes.county=aca.state AND 
        statecodes.countycode=0;
""")

print('done')