import React, {Component} from 'react';
var _ = require('underscore');
import Map from '../components/Map';
import PolicyMenu from '../components/PolicyMenu';
import Slider from 'react-rangeslider';

export default class Explore extends Component{
	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
			 	<div style={{position : 'relative', bottom : 0, width : '20%', float : 'left'}}> 
			    	<PolicyMenu/>
			    </div>
			    <div style={{position : 'relative', bottom : 0, marginLeft : '20%'}}> 
			    	<Map/>
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