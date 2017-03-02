#!/usr/bin/env python 

import pandas
import pdb
from sqlalchemy import create_engine

engine = create_engine('postgresql://localhost:5432/sociome')

data = pandas.read_excel('./aca_data.xlsx', skiprows=1)
metadata = pandas.read_excel('./aca_data.xlsx', sheetname=1)

data = data.rename(index=str, columns={'State' : 'state', 'Year' : 'year'})

metadata.columns = ['variable_name', 'variable_code', 'source', 'link', 'access_date']

data.to_sql('aca', engine, index=False)
metadata.to_sql('aca_metadata', engine, index=False)

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