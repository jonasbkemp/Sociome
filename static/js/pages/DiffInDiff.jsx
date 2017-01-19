import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from '../stores/DataStore';
import {states} from '../data/StateCodes';
import Spinner from 'react-spinkit';
import DiffInDiffResults from '../components/DiffInDiffResults';
import * as _ from 'lodash';

/*
both predictor variable and dependent variables are from the health outcomes dataset
*/
				
export default class Sandbox extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVars : [],
			depVar : undefined,
			treatmentGroup : [],
			years : [],
			yearOfTreatment : undefined,
		}
		var exclude = {'AS' : true, 'DC' : true, 'FM' : true, 'GU' : true, 'MH' : true,
					   'MP' : true, 'PW' : true, 'PR' : true, 'VI' : true}
		this.states = []
		for(var state in states){
			if(!exclude[states[state]]){
				this.states.push({value : states[state], label : state})
			}
		}
		this.states.sort((a, b) => a.label < b.label ? -1 : (a.label === b.label) ? 0 : 1)
	}

	runR = (event) => {
		var predVars = this.state.predVars.map((v) => `predVars=\"${v.value}\"`).join('&')
		var treatmentGroup = this.state.treatmentGroup.map((i) => `treatmentGroup=\"${i.label}\"`).join('&')
		var url = `/DiffInDiff?${predVars}&depVar=\"${this.state.depVar}\"
&${treatmentGroup}&yearOfTreatment=${this.state.yearOfTreatment}`
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
			this.setState(_.extend({}, this.state, {predVars : event, results : undefined}))
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
			this.getYears(event.value)
		}
	}

	updateTreatmentGroup = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				treatmentGroup : [],
				yearOfTreatment : undefined,
				results : undefined
			}))
		}else{
			this.setState(_.extend({}, this.state, {treatmentGroup : event, results : undefined}))
		}
	}

	setYearOfTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {yearOfTreatment : undefined, results : undefined}))
		}else{
			this.setState(_.extend({}, this.state, {yearOfTreatment : event.value, results : undefined}))
		}
	}

	getYears = (depVar) => {
		var predVars = this.state.predVars.map((pv) => `predVars=${pv.value}`).join('&')
		$.get(`/SynthGetYears?depVar=${depVar}&${predVars}`).then((years) => {
			var options = []
			// Start at 1 because we need at least one year prior for pre-treatment years
			for(var i = 1; i < years.length; i++){
				options.push({label : years[i], value : years[i]})
			}
			this.setState(_.extend({}, this.state, {years : options}))
		})
	}

	render(){
		var results = []
		for(var field in this.state.results){
			results.push(<div key={field}>{field}: {this.state.results[field]}</div>)
		}
		return(
			<div style={{width : '100%', height : '100%'}}>
				<h1 style={{textAlign : 'center'}}>Difference in Differences</h1>

				<div style={{width : "100%", height : '100%', overflow: "scroll", position : 'absolute'}}>
				    <div style={{width : '30%', float : 'left', paddingTop : '5%', position : 'absolute'}}> 
				    	<div style={{width : '80%', margin : '0 auto'}}>
				    		<h3 style={{textAlign : 'center'}}>Predictor Variable</h3>
					    	<Select
					    		onChange={this.setPredVar}
					    		options={policyStore.getDemographics()}
					    		value={this.state.predVars}
					    		multi
					    		tabSelectsValue={false}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Dependent Variable</h3>
					    	<Select
					    		onChange={this.setDepVar}
					    		options={policyStore.getMeasures()}
					    		value={this.state.depVar}
					    		disabled={this.state.predVars.length === 0}
					    		tabSelectsValue={false}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Treatment Group</h3>
					    	<Select
					    		onChange={this.updateTreatmentGroup}
					    		options={this.states}
					    		disabled={this.state.depVar === undefined}
					    		value={this.state.treatmentGroup}
					    		tabSelectsValue={false}
					    		multi
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Year of Treatment</h3>
					    	<Select
					    		onChange={this.setYearOfTreatment}
					    		tabSelectsValue={false}
					    		options={this.state.years}
					    		value={this.state.yearOfTreatment}
					    		disabled={this.state.treatmentGroup.length === 0}	
					    		menuBuffer={500}
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.runR} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.yearOfTreatment === undefined}
					    	>
					    		Run Difference in Differences
					    	</Button>
					    	{/*Add some spacing at the bottom to account for the dropdown of the last menu*/}
					    	<div style={{height : 120}}></div>
				    	</div>
				    </div>
				    <div style={{position : 'absolute', width : '70%', height : '100%', right : 0}}> 
				    	{
				    		this.state.runningR ? 
    							<Spinner spinnerName='double-bounce'/> :
    							<DiffInDiffResults results={this.state.results}/>
				    	}
				    </div>
				</div>
			</div>
		)
	}
}