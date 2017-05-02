#!/usr/bin/env python


import psycopg2, pdb, json

conn = psycopg2.connect(dbname = 'sociome')
cur = conn.cursor()


cur.execute("""
    SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'policy'
""")

skip = set(['state', 'year', 'statecode', 'countycode'])

binary = []

def has_policy_change(col):
    cur.execute('SELECT statecode, year, %s FROM policy ORDER BY statecode, year' % col)
    rows = cur.fetchall()
    prev = rows[0]
    for row in rows[1:]:
        if row[0] == prev[0] and row[2] > prev[2]:
            return True
        prev = row
    return False


for col, in cur.fetchall():
    if col in skip:
        continue
    cur.execute('SELECT DISTINCT "%s" FROM policy WHERE "%s" IS NOT NULL' % (col, col))
    rows = cur.fetchall()
    print('%s has %d rows' % (col, len(rows)))
    if len(rows) == 2:

        if not(has_policy_change(col)):
            continue

        cur.execute("SELECT * FROM policy_metadata WHERE lower(variable_code)='%s'" % col)
        res = cur.fetchall()
        if len(res) == 0:
            print('BAD!!!!')
            pdb.set_trace()

        label = res[0][0]
        binary.append({
            'value' : col,
            'label' : label,
            'dataset' : 'policy'
        })



json.dump(binary, open('../../backend/variables/policy.json', 'w'))