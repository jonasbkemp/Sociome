var pg = require('pg')
var express = require('express')
var router = express.Router()
var pg = require('pg');
var rio = require('rio');
var path = require('path')
var _ = require('lodash')

var config = process.env.OPENSHIFT_POSTGRESQL_DB_URL ? 
            process.env.OPENSHIFT_POSTGRESQL_DB_URL : 
            {database : 'sociome', password : process.env.DB_PWD};

var config = {
  database : 'sociome',
  user : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  host : process.env.DB_HOST,
  port : process.env.DB_PORT
}

const socket = process.env.SOCK_LOC || path.join(__dirname, 'rserve.sock')

var db = new pg.Client(config);
db.connect();

/**
 * selectTable - Returns a query that selects `args` from `table`.
 * This functin is capable of returning functions for both inner
 * and outer joins.
 * @param  {string}  table           Which table to select from
 * @param  {Array}  args             The columns to select
 * @param  {Boolean} inner           Should this be an inner join? (false for outer join)
 * @param  {Boolean} includeCounties Should we include counties? (false for no)
 * @return {String}                  Returns an SQL query
 */
function selectTable(table, args, inner = true, includeCounties=true){
  var cols = ['year', 'statecode']
  if(table === 'health_outcomes'){
    cols.push('countycode')
    cols = cols.concat(args.map(a => `${a.value}->'rawvalue' as ${a.value}`))
  }else if(table === 'policy'){
    cols = cols.concat(args.map(a => a.value))
  }else{
    cols = cols.concat(['countycode']).concat(args.map(a => a.value))
  }
  var whereClause = ` ${(args.map(a => `${a.value} IS NOT NULL `)).join(inner ? ' AND ' : ' OR ')}`
  if(!includeCounties){
    whereClause = ` (${whereClause}) AND countycode=0 ` 
  }
  return `SELECT ${cols.join(',')} FROM ${table} WHERE ${whereClause}`
}

/**
 * mkQuery - Join together a bunch of variables from different
 * tables
 * @param  {Array}  params  Which columns to select along with the tables they come from
 * @param  {Boolean} inner  Inner or outer join?
 * @return {String}         PostgreSQL query
 */
function mkQuery(params, inner=true){
  var grouped = _.groupBy(params, p => p.dataset)
  tables = Object.keys(grouped)

  var includeCounties = grouped.policy == null;

  var joinVars = ['year', 'statecode']
  if(!grouped['policy']){
    joinVars.push('countycode')
  }

  var vars = joinVars.concat(params.map(p => p.value))

  if(tables.length === 1){
    return selectTable(tables[0], grouped[tables[0]], inner, includeCounties);
  }

  var subQuery = `(${selectTable(tables[0], grouped[tables[0]], inner, includeCounties)}) table_0`
  for(var i = 1; i < tables.length; i++){
    subQuery += `
      ${inner ? 'INNER JOIN ' : 'FULL OUTER JOIN'} 
      (${selectTable(tables[i], grouped[tables[i]], inner, includeCounties)}) table_${i} 
      USING (${joinVars.join(',')})
    `
  }
  return `SELECT ${vars.join(',')} FROM (${subQuery}) subQ`
}

/**
 * Get the policy data for a specific field.  The year
 * parameter is optional.  If it is not provided, then all 
 * data points will be returned ordered by year
 * @param  {String} policy - The policy to select (table)
 * @param  {String} field - The policy field (column)
 * @param  {Integer} year - Which year to select for
 * @return {Array<{state : String, year : Integer, value : Float}>}
 */
router.get('/PolicyData', function(req, res){
  var table = req.query.policy
  var field = req.query.field
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`
  var query = `
    SELECT state, year, ${field} as value 
    FROM ${table} 
    WHERE ${field} IS NOT NULL ${yearClause};`

  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

/**
/* Get a column out of the demographics table.  `year` is 
 * optional.  If not provided, all years are returned ordered by year
 * @param  {String} col - Which demographics column to select
 * @param  {Integer} year - Which year to select for
 * @return {Array<Object>}
 */
router.get('/Demographics', function(req, res){
  var col = req.query.col;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;

  var query = `
    SELECT 
      year, 
      state, 
      ${col} as value, 
      statecode as statecode, 
      countycode as countycode 
    FROM demographics 
    WHERE ${col} IS NOT NULL ${yearClause};`;
  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

/**
 * Get a column out of the Health Outcomes table.
 * 
 * @param  {String} measure_name - Which measure to select
 * @param  {Integer} year - Which year to select for
 * @return {Array<Object>}
 */
router.get('/HealthOutcomes', function(req, res){
  var measure_name = req.query.measure_name;
  var yearClause = req.query.year ? `AND year=${req.query.year}` : `ORDER BY year`;
  var query = `
    SELECT 
      year, 
      county as state, 
      ${measure_name}->'rawvalue' as value,
      countycode, 
      statecode 
    FROM health_outcomes 
    WHERE ${measure_name} IS NOT NULL ${yearClause};`;
  db.query(query).then(data => {
    res.json(data.rows)
  }).catch(err => {
    res.status(500).send(err)
  })
})

router.post('/LinRegression', function(req, res){
  var params = req.body;

  var mkArg = (arg) => {
    var fields = [];
    for(var field in arg){
      if(field !== 'years'){
        fields.push(`${field}='${arg[field]}'`)
      }
    }
    return `list(${fields.join(',')})`;
  }

  var controls = params.controls.map(mkArg)

  var cmd = `
    runRegression(
      ${mkArg(params.dependent)}, 
      ${mkArg(params.independent)}, 
      list(${controls.join(',')})
    )
  `

  rio.e({
    command : cmd,
    path : socket,
    callback : (err, result) => {
      if(err){
        console.log(err)
        res.status(500).json(err)
      }else{
        res.send(result)
        console.log(result)
      }
    }
  })
})

/*
Sample input:
{
  "predVars": [
    {
      "value": "aedspt",
      "label": "Corrections Expenditures",
      "dataset": "policy"
    },
    {
      "value": "rpolice",
      "label": "Police Ratio",
      "dataset": "policy"
    },
    {
      "value": "percent_persons_25_plus_w_4_plus_yrs_college",
      "label": "Percent 25+ Years with 4+ Years College",
      "dataset": "demographics"
    }
  ],
  "depVar": {
    "value": "air_pollution_particulate_matter",
    "label": "Air Pollution - Particulate Matter",
    "dataset": "health_outcomes"
  },
  "controlGroup": [
    "Arkansas",
    "Delaware",
    "Florida",
    "Illinois",
    "Indiana"
  ],
  "treatmentGroup": [
    "Arizona",
    "Colorado"
  ],
  "yearOfTreatment": 1961
}
 */

router.post('/DiffInDiff', function(req, res){
  var params = req.body

  var queryArgs = params.predVars;
  queryArgs.push(params.depVar)

  var query = mkQuery(queryArgs, true) // Inner join

  var command = `runDiffInDiff(
    "${query}",
    c(${params.predVars.map(p => `"${p.value}"`).join(',')}),
    "${params.depVar.value}",
    c(${params.controlGroup.map(c => `"${c}"`).join(',')}),
    c(${params.treatmentGroup.map(t => `"${t}"`).join(',')}),
    ${params.yearOfTreatment}
  )`

  console.log(command)

  rio.e({
    command : command,
    path : socket,
    callback : (err, result) => {
      if(err){
        console.log(err)
        res.status(500).json(err)
      }else{
        res.send(result)
        console.log(result)
      }
    }
  })
})

router.post('/CSV', (req, res) => {
  var fields = req.body.fields

  var query = mkQuery(fields, false)

  console.log(query)

  db.query(query, (err, result) => {
    if(err){
      console.log(err)
      res.status(500).send(err)
    }else{
      res.set('Content-type', 'text/csv')
      console.log(`Sending back CSV with ${result.rows.length} rows`)
      var body = Object.keys(result.rows[0]).join(',') + '\n'
      result.rows.forEach(row => {
        body += Object.keys(row).map(k => row[k]).join(',') + '\n'
      })
      res.send(body)
    }
  })

})

module.exports = router