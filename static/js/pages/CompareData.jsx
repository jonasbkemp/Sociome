import React, {Component} from 'react'
import Select from 'react-select';
import {leftStore, rightStore} from '../stores/DataStore';
import CompareMap from '../components/CompareMap';

export default class CompareData extends Component{
	render(){
		return(
			<div>
				<div style={styles.leftMap}>
					<CompareMap policyStore={leftStore}/>
				</div>
				<div style={styles.rightMap}>
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