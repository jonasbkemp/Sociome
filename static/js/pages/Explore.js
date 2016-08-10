import React, {Component} from 'react';
var _ = require('underscore');
import Map from '../components/Map';
import PolicyMenu from '../components/PolicyMenu';
import Slider from 'react-rangeslider';

export default class Explore extends Component{
	_changeYear(year){
		console.log('year = ' + year)
	}
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
	},
	slider : {
		position : 'absolute',
		top : 100,
		left : 50
	}
}