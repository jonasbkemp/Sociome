#!/usr/bin/env python


import psycopg2 
import glob
import os
import pdb

conn = psycopg2.connect(database='sociome')
cur = conn.cursor()

for file in glob.glob('data/*'):
    table = os.path.splitext(os.path.basename(file))[0]

    cur.execute('ALTER TABLE %s ADD COLUMN IF NOT EXISTS statecode int' % table)
    cur.execute('ALTER TABLE %s ADD COLUMN IF NOT EXISTS countycode int' % table)

    cur.execute("""
        UPDATE %s SET statecode=statecodes.statecode, countycode=statecodes.countycode
        FROM statecodes
        WHERE county=%s.state
    """ % (table, table))

conn.commit()