#!/usr/bin/env python

import pdb

# Coalesce `df` into `dest`
def coalesce(dest, df, engine, new_table):
    engine.execute('CREATE SCHEMA IF NOT EXISTS scratch')

    dest.to_sql('dest', engine, schema='scratch', index=False, if_exists='replace')
    df.to_sql('temp', engine, schema='scratch', index=False, if_exists='replace')

    cols = set(dest.columns)
    cols.remove('fips')
    cols.remove('statecode')
    cols.remove('countycode')

    updates = map(lambda c: '%(c)s=COALESCE(scratch.temp.%(c)s, scratch.dest.%(c)s)' % {'c' : c}, cols)

    query = """UPDATE scratch.dest SET %s FROM scratch.temp WHERE scratch.dest.year=scratch.temp.year AND scratch.dest.countycode=scratch.temp.countycode AND scratch.dest.statecode=scratch.temp.statecode""" % (','.join(updates))

    engine.execute(query)

    engine.execute('DROP TABLE IF EXISTS %s' % new_table)
    engine.execute('DROP TABLE IF EXISTS scratch.%s' % new_table)

    engine.execute('ALTER TABLE scratch.dest RENAME TO %s' % new_table)
    engine.execute('ALTER TABLE scratch.%s SET SCHEMA public' % new_table)
    engine.execute('DROP SCHEMA scratch CASCADE')