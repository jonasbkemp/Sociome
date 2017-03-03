#!/usr/bin/env python

import pdb, os, re, sys, pandas
from sqlalchemy import create_engine
from subprocess import check_output

engine = create_engine('postgresql://localhost:5432/sociome')

if not(os.path.exists('data')):
    os.mkdir('data')

if not(os.path.exists('data/EducationData.csv')):
    url='https://github.com/ArnholdInstitute/Sociome-Data/raw/master/demographics/EducationData.csv'
    check_output(['wget', '-O', 'data/EducationData.csv', url])

if not(os.path.exists('data/PopDemographicsData.csv')):
    url='https://github.com/ArnholdInstitute/Sociome-Data/raw/master/demographics/PopDemographicsData.csv'
    check_output(['wget', '-O', 'data/PopDemographicsData.csv', url])

def buildMask(f, headers):
    cols = []
    for i in range(len(headers)):
        if f(headers[i]):
            cols.append(headers[i])
    return cols

def processYear(y):
    if type(y) == str and '-' in y:
        years = y.split('-')
        year = (int(years[0]) + int(years[1])) / 2
        return int(year)
    else:
        return int(y)

def convertCol(c):
    c = c.replace('%', ' percent ')
    c = c.replace('+', ' plus ')
    c = c.replace('<', ' lessthan ')
    c = re.sub('(/| |,)+', '_', c.strip().lower())
    return c

def process_pop():
    data = pandas.read_csv('data/PopDemographicsData.csv')
    data['Year'] = data['Year'].apply(processYear)
    cols = [
        'FIPS',
        'Year',
        'State Name',
        'State Abbrev',
        'County Name',
        'County Name, State Abbrev',
        'FIPS State Code',
        'FIPS County Code',
        'Federal Region Code',
        'Census Region Code',
        'Census Region Name',
        'Census Division Code',
        'Census Division Name',
        'Population Estimate'
    ]

    newDataset = data[cols]

    totalPop = data['Population Estimate']

    races = ['White', 'Wh Non-Hisp/Lat', 'Wh Hisp/Latino', 'Black/Afr Am', 'Am Ind/Alaska Nat', 'Asian', 'Nat Haw/Oth Pac Isl']
    genders = ['Male', 'Female']
    ages = ['< 15', '15-19', '20-24', '25-44', '45-64', '65+']

    # Aggregate races
    for race in races:
        cols = buildMask(lambda header : race in header, data.columns)
        newDataset['population_' + race.replace('-', '_')] = data[cols].sum(axis=1) / totalPop * 100

    # Aggregate Age Distribution
    for age in ages:
        cols = buildMask(lambda header : ('Male ' + age) in header or ('Female ' + age) in header, data.columns)
        col_name = 'population_' + age.replace('< ', 'lt_').replace('-', '_to_').replace('+', '_plus')
        newDataset[col_name] = data[cols].sum(axis=1) / totalPop * 100
        
    # Aggregate Gender Distribution
    cols = buildMask(lambda header : 'Population Female' in header, data.columns)
    newDataset['population_female'] = data[cols].sum(axis=1) / totalPop * 100

    # Aggregate Income Distribution
    cols = buildMask(lambda header : 'Per Capita Income' in header, data.columns)
    newDataset['per_capita_income'] = data[cols].sum(axis=1) / totalPop * 100

    newDataset['median_household_income'] = data['Median  Household Income']

    newDataset['median_family_income'] = data['Median Family Income']

    newDataset['persons_in_poverty'] = data['% Persons in Poverty']

    newDataset['eligible_for_medicare'] = data['# Eligible for Medicare'] / totalPop * 100

    newDataset['receiving_foodstamps'] = data['Food Stamp/SNAP Recipient Estimate'] / totalPop * 100

    newDataset['females_divorced'] = data['% Females Divorced']

    newDataset['unemployment_rate'] = data['Unemployment Rate, 16+']

    newDataset.columns = map(lambda c: re.sub('( |/|,)+', '_', c.lower()), newDataset.columns)

    newDataset = newDataset.rename(index=str, columns={'state_name' : 'state', 'county_name' : 'county', 'fips_state_code': 'statecode', 'fips_county_code': 'countycode'})

    newDataset.to_sql('demographics_pop', engine, index=False, if_exists='replace')

def process_education():
    data = pandas.read_csv('./data/EducationData.csv')

    data.columns = map(convertCol, data.columns)

    data = data.rename(index=str, columns={
        'state_name' : 'state', 
        'county_name' : 'county', 
        'fips_state_code': 'statecode', 
        'fips_county_code': 'countycode'
    })

    data['year'] = data['year'].apply(processYear)

    del data['fips']
    del data['state']
    del data['state_abbrev']
    del data['county']
    del data['county_name_state_abbrev']
    del data['federal_region_code']
    del data['census_region_code']
    del data['census_region_name']
    del data['census_division_code']
    del data['census_division_name']

    data.to_sql('demographics_education', engine, index=False, if_exists='replace')

if __name__ == '__main__':
    process_pop()
    process_education()
    engine.execute('DROP TABLE IF EXISTS demographics;')
    engine.execute("""
        CREATE TABLE demographics AS(SELECT * FROM demographics_pop 
        FULL OUTER JOIN demographics_education USING (year, statecode, countycode));
    """)
    engine.execute('DROP TABLE demographics_pop;')
    engine.execute('DROP TABLE demographics_education;')
