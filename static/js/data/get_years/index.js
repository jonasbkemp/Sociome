var pg = require('pg')
var _ = require('lodash')
var fs = require('fs')

var demographics = require('../DemographicCategories').demographicCategories
var policy = require('../PolicyCategories').policyCategories;
var healthOutcomes = require('../HealthOutcomesCategories').healthOutcomesCategories;


var db = new pg.Client({database : 'sociome'})
db.connect()

var ps = []
for(var key in healthOutcomes){
	var category = healthOutcomes[key];
	for(var i = 0; i < category.length; i++){
		ps.push(db.query(`SELECT DISTINCT year FROM health_outcomes WHERE measurename='${category[i].value}' ORDER BY year`))
	}
}

var p1 = new Promise((resolve, reject) => {
	Promise.all(ps).then(results => {
		var count = 0;
		for(var key in healthOutcomes){
			var category = healthOutcomes[key];
			for(var i = 0; i < category.length; i++){
				category[i].years = results[count].rows.map(y => y.year)
				count++;
			}
		}
		fs.writeFileSync('healthOutcomes.json', JSON.stringify(healthOutcomes))
		resolve()
	}).catch(err => {
		console.log(err)
	})
})

debugger

var ps2 = []
for(var key in demographics){
	var category = demographics[key];
	for(var i = 0; i < category.length; i++){
		ps2.push(db.query(`SELECT DISTINCT year FROM demographics WHERE ${category[i].value} IS NOT NULL ORDER BY year;`))
	}
}

var p2 = new Promise((resolve, reject) => {
	Promise.all(ps2).then(results => {
		var count = 0;
		for(var key in demographics){
			var category = demographics[key];
			for(var i = 0; i < category.length; i++){
				category[i].years = results[count].rows.map(y => y.year);
				count++;
			}
		}
		fs.writeFileSync('demographics.json', JSON.stringify(demographics))
		resolve()
	}).catch(err => {
		console.log(err)
	})
})

debugger

var ps3 = [];
for(var k1 in policy){
	for(var k2 in policy[k1]){
		var category = policy[k1][k2];
		for(var i = 0; i < category.length; i++){
			ps3.push(db.query(`SELECT DISTINCT year FROM ${category[i].table} WHERE ${category[i].value} IS NOT NULL ORDER BY year;`))
		}
	}
}


var p3 = new Promise((resolve, reject) => {
	Promise.all(ps3).then(results => {
		var count = 0;
		for(var k1 in policy){
			for(var k2 in policy[k1]){
				var category = policy[k1][k2];
				for(var i = 0; i < category.length; i++){
					category[i].years = results[count].rows.map(y => y.year);
					count++;
				}
			}
		}
		fs.writeFileSync('policy.json', JSON.stringify(policy));
		resolve()
	}) .catch(err => console.log(err))
})

Promise.all([p1, p2, p3]).then(x => {
	db.end()
})




