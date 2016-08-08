import React, {Component} from 'react';
var _ = require('underscore');
import Map from '../components/Map';
import PolicyMenu from '../components/PolicyMenu';

export default class Explore extends Component{
	render(){
		return(
			<div>
				<Map/>
				<div style={styles.policyMenu}>
					<PolicyMenu style={styles.policyMenu}/>
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