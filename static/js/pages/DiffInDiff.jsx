import React from 'react';
import ExploreBar from '../components/ExploreBar';
import DnDFieldMenu from '../components/DnDFieldMenu';
import update from 'react/lib/update';
import DiffInDiffResults from '../components/DiffInDiffResults';
import dispatcher from '../Dispatcher'
import * as AnalysisActions from '../actions/AnalysisActions'
import Select from 'react-select'
import {states as States} from '../data/StateCodes';
import {Button} from 'react-bootstrap'
import * as _ from 'lodash'

class DiffInDiff extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			bins : [
				{
					accepts : ['field'], 
					items : [], 
					multi : true,
					onDrop : (item) => this.handleDrop(0, item, true),
					label : 'Predictor Variables',
				},
				{
					accepts : ['field'], 
					items : [],
					onDrop : (item) => this.handleDrop(1, item, false),
					label : 'Dependent Variable',
				}
			],
			treatmentGroup : [],
			controlGroup : [],
			yearOfTreatment : null,
			minYear : null,
			maxYear : null
		}

		var exclude = {'AS' : true, 'DC' : true, 'FM' : true, 'GU' : true, 'MH' : true,
					   			 'MP' : true, 'PW' : true, 'PR' : true, 'VI' : true}

		this.states = []
		for(var state in States){
			if(!exclude[States[state]]){
				this.states.push({value : States[state], label : state})
			}
		}
		this.states.sort((a, b) => a.label < b.label ? -1 : (a.label === b.label) ? 0 : 1)
	}

	handleDrop = (index, value, multi) => {
		for(let item of this.state.bins[index].items){
			if(value.value === item.value && value.label === item.label){
				//This item already exists in this bin, do nothing...
				return 
			}
		}
		var newState = update(this.state, {
			bins : {
				[index] : {
					items : multi ? {$push : [value]} : {$set : [value]}
				}
			}
		})
		var minYear = this.state.minYear;
		var maxYear = this.state.maxYear;
		for(let bin of newState.bins){
			for(let item of bin.items){
				minYear = Math.min(minYear || Number.MAX_SAFE_INTEGER, item.years[0]);
				maxYear = Math.max(maxYear || Number.MIN_SAFE_INTEGER, item.years[item.years.length-1]);
			}
		}

		this.setState(update(newState, {
			maxYear : {$set : maxYear},
			minYear : {$set : minYear}
		}))
	}

	generateModel = () => {
		const selector = ({value, label, dataset}) => ({value, label, dataset})
		const args = {
			predVars : this.state.bins[0].items.map(selector),
			depVar : selector(this.state.bins[1].items[0]),
			controlGroup : this.state.controlGroup.map(({label}) => label),
			treatmentGroup : this.state.treatmentGroup.map(({label}) => label),
			yearOfTreatment : this.state.yearOfTreatment.value
		}
		
		AnalysisActions.diffInDiff(args, results => {
			this.setState({...this.state, results : results})
		})
	}

	buttonDisabled = () => {
		return(
			this.state.bins[0].items.length === 0 ||
			this.state.bins[1].items.length === 0 ||
			this.state.controlGroup.length === 0 ||
			this.state.treatmentGroup.length === 0 || 
			this.state.yearOfTreatment == null
		)
	}	

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}} class='container-fluid'>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<DnDFieldMenu 
				    			noYears={true}
				    			bins={this.state.bins}
				    		/>
				    		<div class='row' style={{marginBottom : 10}}>
				    			<div class='col-xs-10 col-xs-offset-1'>
						    		<Select
						    			multi
						    			placeholder='Treatment Group'
						    			value={this.state.treatmentGroup}
						    			onChange={states => this.setState({...this.state, treatmentGroup : states})}
						    			options={this.states}
						    		/>
					    		</div>
				    		</div>
				    		<div class='row' style={{marginBottom : 10}}>
				    			<div class='col-xs-10 col-xs-offset-1'>
						    		<Select
						    			options={this.states}
						    			multi
						    			placeholder='Control Group'
						    			value={this.state.controlGroup}
						    			onChange={states => this.setState({...this.state, controlGroup : states})}
						    		/>
					    		</div>
				    		</div>
				    		<div class='row' style={{marginBottom : 10}}>
				    			<div class='col-xs-10 col-xs-offset-1'>
						    		<Select
						    			placeholder='Year of Treatement'
						    			options={this.state.minYear && _.range(this.state.minYear, this.state.maxYear).map(y => ({label : y, value:  y}))}
						    			value={this.state.yearOfTreatment}
						    			onChange={item => this.setState({...this.state, yearOfTreatment : item})}
						    		/>
					    		</div>
				    		</div>
				    		<div class='row'>
				    			<div class='col-xs-8 col-xs-offset-2'>
				    				<Button bsStyle='primary' onClick={this.generateModel} disabled={this.buttonDisabled()}>
				    					Generate Model
				    				</Button>
				    			</div>
				    		</div>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%', height : 400}}>
					    		<DiffInDiffResults 
					    			results={this.state.results}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

export default DiffInDiff;