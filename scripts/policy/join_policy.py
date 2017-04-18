#!/usr/bin/env python

import psycopg2, glob, os, pdb


conn = psycopg2.connect(dbname='sociome')
cur = conn.cursor()

query = 'CREATE TABLE policy AS '
first = True
count = 0

tables = map(lambda t: os.path.splitext(os.path.basename(t))[0], glob.glob('policy/*.xls*'))

joinCols = {'state', 'year', 'statecode', 'countycode'}

duplicates = {}

seen = set()

for file in glob.glob('policy/*.xls*'):
    table = os.path.splitext(os.path.basename(file))[0]
    if table != 'a_fiscal_11':
        cur.execute('ALTER TABLE %s DROP COLUMN IF EXISTS apop' % table)

    cur.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = '%s'
    """ % table)

    cols = cur.fetchall()

    for col, in cols:
        if col in joinCols:
            continue
        if col in seen:
            if col in duplicates:
                duplicates[col].append(table)
            else:
                duplicates[col] = [table]
        else:
            seen.add(col)

    if first:
        query += ' SELECT * FROM %s ' % table
    else:
        query += ' FULL OUTER JOIN %s USING (state, year, statecode, countycode) ' % table
    first = False

for key in duplicates:
    tables = duplicates[key]
    for table in tables:
        cur.execute('ALTER TABLE %s DROP COLUMN %s;' % (table, key))


cur.execute(query)
conn.commit()

