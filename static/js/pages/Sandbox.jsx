import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from '../stores/DataStore';
import {states} from '../data/StateCodes';
import util from 'util'
import SynthResults from '../components/SynthResults';
import Spinner from 'react-spinkit';

var _ = require('underscore')


const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';

				
export default class Sandbox extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVars : [],
			depVar : undefined,
			treatment : undefined,
			controlIdentifiers : [],
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

	runSynth = (event) => {
		var predVars = this.state.predVars.map((v) => `predVars=\"${v.value}\"`).join('&')
		var controlIdentifiers = this.state.controlIdentifiers.map((i) => `controlIdentifiers=\"${i.label}\"`).join('&')
		var url = `${BACKEND_URL}/Synth?${predVars}&depVar=\"${this.state.depVar}\"&treatment=\"${this.state.treatment.label}\"
&${controlIdentifiers}&yearOfTreatment=${this.state.yearOfTreatment}`
		console.log(url)
		this.setState(_.extend({}, this.state, {runningSynth : true}))
		$.get(url, (res) => {
			console.log(res)
			this.setState(_.extend({}, this.state, {runningSynth : false, results : res}))
		})
	}

	setPredVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				predVars : [],
				depVar : undefined,
				treatment : undefined,
				controlIdentifiers : [],
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
				treatment : undefined,
				controlIdentifiers : [],
				yearOfTreatment : undefined,
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {depVar: event.value, results : undefined}))
			this.getYears(event.value)
		}
	}

	setTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				treatment : undefined,
				controlIdentifiers : [],
				yearOfTreatment : undefined,
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {treatment : event, results : undefined}))
		}
	}

	updateControlIdentifiers = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				controlIdentifiers : [],
				yearOfTreatment : undefined,
				results : undefined
			}))
		}else{
			this.setState(_.extend({}, this.state, {controlIdentifiers : event, results : undefined}))
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
		$.get(`${BACKEND_URL}/SynthGetYears?depVar=${depVar}&${predVars}`).then((years) => {
			var options = []
			// Start at 1 because we need at least one year prior for pre-treatment years
			for(var i = 1; i < years.length; i++){
				options.push({label : years[i], value : years[i]})
			}
			this.setState(_.extend({}, this.state, {years : options}))
		})
	}

	render(){
		return(
			<div style={{width : '100%', height : '100%'}}>
				<h1 style={{textAlign : 'center'}}>Synthetic Control</h1>
				<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				    <div style={{width : '30%', float : 'left', paddingTop : '5%'}}> 
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
					    	<h3 style={{textAlign : 'center'}}>Treatment</h3>
					    	<Select
					    		onChange={this.setTreatment}
					    		options={this.states}
					    		value={this.state.treatment ? this.state.treatment.value : undefined}
					    		disabled={this.state.depVar === undefined}
					    		tabSelectsValue={false}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Control Identifiers</h3>
					    	<Select
					    		onChange={this.updateControlIdentifiers}
					    		options={this.states}
					    		disabled={this.state.treatment === undefined}
					    		value={this.state.controlIdentifiers}
					    		tabSelectsValue={false}
					    		filterOptions={(options) => {
					    			return options.filter((option) => {
					    				if(this.state.treatment && option.value === this.state.treatment.value){
					    					return false
					    				}else{
					    					for(var i = 0; this.state.controlIdentifiers && i < this.state.controlIdentifiers.length; i++){
					    						if(this.state.controlIdentifiers[i].value === option.value){
					    							return false;
					    						}
					    					}
					    					return true;
					    				}
					    			})
					    		}}
					    		multi
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Year of Treatment</h3>
					    	<Select
					    		onChange={this.setYearOfTreatment}
					    		tabSelectsValue={false}
					    		options={this.state.years}
					    		value={this.state.yearOfTreatment}
					    		disabled={this.state.controlIdentifiers.length === 0}	
					    		menuBuffer={500}
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.runSynth} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.yearOfTreatment === undefined}
					    	>
					    		Run Synthetic Control
					    	</Button>
					    	{/*Add some spacing at the bottom to account for the dropdown of the last menu*/}
					    	<div style={{height : 120}}></div>
				    	</div>
				    </div>
				    <div style={{width : '100%', height : '100%', marginLeft : '30%'}}> 
				    	{
				    		this.state.runningSynth ? 
    							<Spinner spinnerName='double-bounce'/> :
    							<SynthResults results={this.state.results} states={this.state.controlIdentifiers}/>
				    	}
				    </div>
				</div>
			</div>
		)
	}
}