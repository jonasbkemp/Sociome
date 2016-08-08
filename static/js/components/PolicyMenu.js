import React, {Component} from 'react';
import policyStore from '../stores/PolicyStore';
import Select from 'react-select';
require('react-select/dist/react-select.css');
var _ = require('underscore')
import * as PolicyActions from '../actions/PolicyActions';


export default class PolicyMenu extends Component{
	constructor(props){
		super(props)
		this.state = {
			policies : policyStore.getPolicies(),
			currentPolicy : undefined,
			policyFields : policyStore.getPolicyFields(),
			currentPolicyField : undefined
		}
		this.updatePolicy = () => {
			this.setState(_.extend({}, this.state, {
				currentPolicy : policyStore.getCurrentPolicy(),
		    	currentPolicyField : policyStore.getCurrentPolicyField(),
		    	policyFields : policyStore.getPolicyFields(),
			}))
		}
	}

	_changePolicy(event){
		PolicyActions.changePolicy(event ? event.value : undefined)
	}

	_changePolicyField(event){
		PolicyActions.changePolicyField(event ? event.value : undefined)
	}

	componentWillMount() {
	    policyStore.on('change', this.updatePolicy)
	}

	componentWillUnmount () {
	    policyStore.removeListener('change', this.updatePolicy)
	}

	render(){
		console.log('Current policy = ' + this.state.currentPolicy)
		return(
			<div style={styles.policyMenu}>
				<h3>Policies</h3>
				<Select
					value={this.state.currentPolicy}
					addLabelText="Select Policy"
					searchable={true}
					name="policySelect"
					options={this.state.policies}
					onChange={this._changePolicy.bind(this)}
				/>
				<h3>Policy Field</h3>
				<Select
					value={this.state.currentPolicyField}
					disabled={this.state.currentPolicy == undefined}
					addLabelText="Select Policy Field"
					searchable={true}
					name="policyFieldSelect"
					options={this.state.policyFields}
					onChange={this._changePolicyField.bind(this)}
				/>
			</div>
		)
	}
}

const styles = {
	policyMenu : {
		position : 'absolute',
		top : 50,
		left : 0,
		width : 140
	}
}