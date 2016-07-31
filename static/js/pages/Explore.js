import React, {Component} from 'react';
import policyStore from '../stores/PolicyStore';
var _ = require('underscore');
import Map from '../components/Map';

export default class Explore extends Component{

	constructor(){
		super();
		this.state = {
			policies : policyStore.getPolicies(),
			currentPolicy : undefined
		}
	}

	_changePolicy(event){
		console.log(event)
		this.setState(_.extend({}, this.state, {currentPolicy : event.target.name}))
	}

	render(){
		return(
			<div>
				<Map/>
				<div style={styles.policyMenu}>
					{
						this.state.policies.map((policy) => 
							<h4 key={policy}>
								<a href="#" onClick={this._changePolicy.bind(this)} name={policy}>
									{policy}
								</a>
							</h4>
						)
					}
				</div>
			</div>
		)
	}
}

const styles={
	map : {
		position : 'absolute',
		top : 0,
		left : 0,
		width : '100%',
		height : '100%',
	},
	policyMenu : {
		position : 'absolute',
		top : 100,
		left : 30,
	}
}