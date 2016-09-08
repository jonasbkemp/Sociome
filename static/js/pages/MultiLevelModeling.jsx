import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from 'sociome/stores/DataStore';
import {states} from 'sociome/data/StateCodes';
import util from 'util'
import Spinner from 'react-spinkit';

var _ = require('underscore')


/*
the error components model (random).

plm(formula = inv ~ value + capital, data = Grunfeld, model = "random")

states (all) => observation
index = c('state', 'year')

plm(formula = )

lme(dependVar ~ treatment * year, data = dataframe, random = ~state)

treated is the predictor variable

	formula <- as.formula(paste(depVar, ' ~ treated + time + did', collapse=''))

	didreg <- lm(formula, data=dataframe)
*/

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';
		
export default class MultiLevelModeling extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVar : undefined,
			depVar : undefined,
		}
	}

	runR = (event) => {
		var url = `${BACKEND_URL}/Multilevel?predVar=\"${this.state.predVar}\"&depVar=\"${this.state.depVar}\"`
		console.log(url)
		this.setState(_.extend({}, this.state, {runningR : true}))
		$.get(url, (res) => {
			res = JSON.parse(res)
			console.log(res)
			this.setState(_.extend({}, this.state, {runningR : false, results : res}))
		})
	}

	setPredVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				predVars : [],
				depVar : undefined,
				treatmentGroup : [],
				yearOfTreatment : undefined,
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {predVar : event.value, results : undefined}))
		}
	}

	setDepVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				depVar : undefined,
				treatmentGroup : [],
				yearOfTreatment : undefined,
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {depVar: event.value, results : undefined}))
		}
	}

	render(){
		var results = []
		for(var field in this.state.results){
			results.push(<div key={field}>{field}: {this.state.results[field]}</div>)
		}
		return(
			<div style={{width : '100%', height : '100%'}}>
				<h1 style={{textAlign : 'center'}}>Multi Level Modeling</h1>
				<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				    <div style={{width : '30%', float : 'left', paddingTop : '5%'}}> 
				    	<div style={{width : '80%', margin : '0 auto'}}>
				    		<h3 style={{textAlign : 'center'}}>Predictor Variable</h3>
					    	<Select
					    		onChange={this.setPredVar}
					    		options={policyStore.getPolicyFields('a_fiscal_11')}
					    		value={this.state.predVar}
					    		tabSelectsValue={false}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Dependent Variable</h3>
					    	<Select
					    		onChange={this.setDepVar}
					    		options={policyStore.getMeasures()}
					    		value={this.state.depVar}
					    		disabled={this.state.predVar === undefined}
					    		tabSelectsValue={false}
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.runR} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.depVar === undefined}
					    	>
					    		Run Multilevel Modeling
					    	</Button>
					    	{/*Add some spacing at the bottom to account for the dropdown of the last menu*/}
					    	<div style={{height : 120}}></div>
				    	</div>
				    </div>
				    <div style={{width : '100%', height : '100%', marginLeft : '30%'}}> 
				    	{
				    		this.state.runningR ? 
    							<Spinner spinnerName='double-bounce'/> :
    							<div>
    								{results}
    							</div>
				    	}
				    </div>
				</div>
			</div>
		)
	}
}