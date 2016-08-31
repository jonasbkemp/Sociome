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
					'http://sociome-ml9951.rhcloud.com/' : 
					'http://localhost:8082/';

				
// TODO: multiple predictors and one dependant
export default class Sandbox extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVars : [],
			depVar : undefined,
			treatment : undefined,
			controlIdentities : [],
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
		var component = this
		var predVars = this.state.predVars.map((v) => 'predVars=\"' + v.value + "\"").join('&')
		var controlIdentities = this.state.controlIdentities.map((i) => 'controlIdentities=\"' + i.label + '\"').join('&')
		var url = util.format('%sSynth?%s&depVar=\"%s\"&treatment=\"%s\"&%s&yearOfTreatment=%d',
							  BACKEND_URL, predVars, this.state.depVar, this.state.treatment.label, 
							  controlIdentities, this.state.yearOfTreatment)
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
				controlIdentities : [],
				yearOfTreatment : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {predVars : event}))
		}
	}

	setDepVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				depVar : undefined,
				treatment : undefined,
				controlIdentities : [],
				yearOfTreatment : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {depVar: event.value}))
		}
	}

	setTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				treatment : undefined,
				controlIdentities : [],
				yearOfTreatment : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {treatment : event}))
		}
	}

	updateControlIdentities = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				controlIdentities : [],
				yearOfTreatment : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {controlIdentities : event}))
		}
	}

	setYearOfTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {yearOfTreatment : undefined}))
		}else{
			this.setState(_.extend({}, this.state, {yearOfTreatment : event.value}))
		}
	}

	render(){
		return(
			<div>
				<h1 style={{textAlign : 'center'}}>Synthetic Control</h1>
				<div style={{width : "100%", overflow: "hidden"}}>
				    <div style={{width : '30%', float : 'left', paddingTop : '5%'}}> 
				    	<div style={{width : '80%', margin : '0 auto'}}>
				    		<h3 style={{textAlign : 'center'}}>Predictor Variable</h3>
					    	<Select
					    		onChange={this.setPredVar}
					    		options={policyStore.getDemographics()}
					    		value={this.state.predVars}
					    		multi
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Dependent Variable</h3>
					    	<Select
					    		onChange={this.setDepVar}
					    		options={policyStore.getMeasures()}
					    		value={this.state.depVar}
					    		disabled={this.state.predVars.length === 0}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Treatment</h3>
					    	<Select
					    		onChange={this.setTreatment}
					    		options={this.states}
					    		value={this.state.treatment ? this.state.treatment.value : undefined}
					    		disabled={this.state.depVar === undefined}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Control Identities</h3>
					    	<Select
					    		onChange={this.updateControlIdentities}
					    		options={this.states}
					    		disabled={this.state.treatment === undefined}
					    		value={this.state.controlIdentities}
					    		filterOptions={(options) => {
					    			return options.filter((option) => {
					    				if(this.state.treatment && option.value === this.state.treatment.value){
					    					return false
					    				}else{
					    					for(var i = 0; this.state.controlIdentities && i < this.state.controlIdentities.length; i++){
					    						if(this.state.controlIdentities[i].value === option.value){
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
					    		options={_.range(1990, 2016).map((y) => {return{value:y,label:y}})}
					    		value={this.state.yearOfTreatment}
					    		disabled={this.state.controlIdentities.length === 0}	
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.runSynth} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.yearOfTreatment === undefined}
					    	>
					    		Run Synthetic Control
					    	</Button>
				    	</div>
				    </div>
				    <div style={{marginLeft : '30%'}}> 
				    	{
				    		this.state.runningSynth ? 
    							<Spinner spinnerName='double-bounce'/> :
    							this.state.results ? 
				    				<SynthResults results={this.state.results} states={this.state.controlIdentities}/> : 
				    				null
				    	}
				    </div>
				</div>
			</div>
		)
	}
}