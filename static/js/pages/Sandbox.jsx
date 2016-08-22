import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from '../stores/DataStore';
import {states} from '../data/StateCodes';
import util from 'util'
var _ = require('underscore')


const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com/' : 
					'http://localhost:8082/';

export default class Sandbox extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVar : undefined,
			depVars : [],
			treatment : undefined,
			controlIdentities : [],
			yearOfTreatement : undefined,
		}
		this.states = []
		for(var state in states){
			this.states.push({value : states[state], label : state})
		}
		this.states.sort((a, b) => a.label < b.label ? -1 : (a.label === b.label) ? 0 : 1)
	}
	
	runSynth = (event) => {
		var component = this
		var depVars = this.state.depVars.map((v) => 'depVars=' + v.value).join('&')
		var controlIdentities = this.state.controlIdentities.map((i) => 'controlIdentities=' + i.value).join('&')
		var url = util.format('%sSynth?predVar=%s&%s&treatment=%s&%s&yearOfTreatment=%d',
							  BACKEND_URL, this.state.predVar, depVars, this.state.treatment, 
							  controlIdentities, this.state.yearOfTreatement)
		$.get(url, function(err, res){
			if(err){
				console.log(err)
			}else{
				//do something...
			}
		})
	}

	setPredVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				predVar : undefined,
				depVars : [],
				treatment : undefined,
				controlIdentities : [],
				yearOfTreatement : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {predVar : event.value}))
		}
	}

	updateDepVars = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				depVars : [],
				treatment : undefined,
				controlIdentities : [],
				yearOfTreatement : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {depVars: event}))
		}
	}

	setTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				treatment : undefined,
				controlIdentities : [],
				yearOfTreatement : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {treatment : event.value}))
		}
	}

	updateControlIdentities = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				controlIdentities : [],
				yearOfTreatement : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {controlIdentities : event}))
		}
	}

	setYearOfTreatment = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {yearOfTreatement : undefined}))
		}else{
			this.setState(_.extend({}, this.state, {yearOfTreatement : event.value}))
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
					    		options={policyStore.getMeasures()}
					    		value={this.state.predVar}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Dependent Variable</h3>
					    	<Select
					    		multi
					    		onChange={this.updateDepVars}
					    		options={policyStore.getDemographics()}
					    		value={this.state.depVars}
					    		disabled={this.state.predVar === undefined}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Treatment</h3>
					    	<Select
					    		onChange={this.setTreatment}
					    		options={this.states}
					    		value={this.state.treatment}
					    		disabled={this.state.depVars.length === 0}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Control Identities</h3>
					    	<Select
					    		onChange={this.updateControlIdentities}
					    		options={this.states}
					    		disabled={this.state.treatment === undefined}
					    		value={this.state.controlIdentities}
					    		multi
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Year of Treatment</h3>
					    	<Select
					    		onChange={this.setYearOfTreatment}
					    		options={_.range(1990, 2016).map((y) => {return {value : y, label : y} }) }
					    		value={this.state.yearOfTreatement}
					    		disabled={this.state.controlIdentities.length === 0}	
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.runSynth} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.yearOfTreatement === undefined}
					    	>
					    		Run Synthetic Control
					    	</Button>
				    	</div>
				    </div>
				    <div style={{marginLeft : '30%'}}> 
				    	
				    </div>
				</div>
			</div>
		)
	}
}