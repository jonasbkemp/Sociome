import React, {Component} from 'react';
import {policyStore} from 'sociome/stores/PolicyStore';
import Select from 'react-select';
require('react-select/dist/react-select.css');
import * as _ from 'lodash';
import * as PolicyActions from 'sociome/actions/PolicyActions';
import ReactBootstrapSlider from 'react-bootstrap-slider';

export default class PolicyMenu extends Component{
	constructor(props){
		super(props)
		this.state = {
			policies : policyStore.getPolicies(),
			currentPolicy : policyStore.getCurrentPolicy(),
			policyFields : policyStore.getPolicyFields(),
			currentPolicyField : policyStore.getCurrentPolicyField(),
			years : policyStore.getYears(),
			yearIndex : policyStore.getYearIndex(),
		}
	}

	//Issue actions based on user interaction
	_changePolicy(event){
		PolicyActions.changePolicy(event ? {code : event.value, label : event.label} : undefined)
	}
	_changePolicyField(event){
		PolicyActions.changePolicyField(event ? {code : event.value, label : event.label} : undefined)
	}
	_changeYear(event){
		event.target.blur()
		PolicyActions.changeYear(event.target.value)
	}

	//listener functions
	updatePolicy = () => {
		this.setState(_.extend({}, this.state, {
			currentPolicy : policyStore.getCurrentPolicy(),
	    	currentPolicyField : policyStore.getCurrentPolicyField(),
	    	policyFields : policyStore.getPolicyFields(),
	    	years : policyStore.getYears(),
	    	yearIndex : policyStore.getYearIndex(),
		}))
	}
	updateYear = () => {
		this.setState(_.extend({}, this.state, {
			yearIndex : policyStore.getYearIndex(),
		}))
	}

	//Attach and detatch listeners from the policyStore
	componentWillMount() {
	    policyStore.on('change-policy', this.updatePolicy)
	    policyStore.on('change-field', this.updatePolicy)
	    policyStore.on('change-year', this.updateYear)
	}
	componentWillUnmount () {
	    policyStore.removeListener('change-policy', this.updatePolicy)
	    policyStore.removeListener('change-field', this.updatePolicy)
	    policyStore.removeListener('change-year', this.updateYear)
	}

	render(){
		return(
			<div style={styles.policyMenu}>
				<h3>Policies</h3>
				<Select
					value={this.state.currentPolicy ? this.state.currentPolicy.code : undefined}
					addLabelText="Select Policy"
					searchable={true}
					name="policySelect"
					options={this.state.policies}
					onChange={this._changePolicy.bind(this)}
				/>
				<h3>Policy Field</h3>
				<Select
					value={this.state.currentPolicyField ? this.state.currentPolicyField.code : undefined}
					disabled={this.state.currentPolicy == undefined}
					addLabelText="Select Policy Field"
					searchable={true}
					name="policyFieldSelect"
					options={this.state.policyFields}
					onChange={this._changePolicyField.bind(this)}
				/>
				<h3>Change Year</h3>
				<div>
				<input
					type="range"
					min={0}
					value = {this.state.yearIndex ? this.state.yearIndex : 0}
					max={this.state.years.length-1}
				    onChange={this._changeYear.bind(this)}
				/>
				</div>
				<h3 class="text-center">{this.state.years[this.state.yearIndex]}</h3>
			</div>
		)
	}
}

const styles = {
	policyMenu : {
		paddingTop : '30%',
		width : '80%',
		margin : '0 auto',
	},
}