import React, {Component} from 'react'
import Select from 'react-select';
import {leftStore, rightStore} from 'sociome/stores/DataStore';
import CompareMap from 'sociome/components/CompareMap';

export default class CompareData extends Component{
	render(){
		return(
			<div style={{width : "100%", overflow: "hidden"}}>
			    <div style={{width : '50%', float : 'left'}}> 
			    	<CompareMap policyStore={leftStore}/>
			    </div>
			    <div style={{marginLeft : '50%'}}> 
			    	<CompareMap policyStore={rightStore}/>
			    </div>
			</div>
		)
	}
}

const styles = {
	leftMap : {
		position : 'absolute',
		width : 650,
		top : 55,
		left : 0
	},
	rightMap : {
		position : 'absolute',
		top : 55,
		left : 650
	}
}