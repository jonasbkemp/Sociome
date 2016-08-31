import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from '../stores/DataStore';
var _ = require('underscore')

export default class DiffInDiff extends React.Component{

	constructor(props){
		super(props)
		this.state = {}
	}

	setControl = (event) => {
		this.setState({control : event})
	}

	render(){
		return(
			<div>
				<h1 style={{textAlign : 'center'}}>Difference in Differences</h1>
				<div style={{width : "100%", overflow: "hidden"}}>
				    <div style={{width : '30%', float : 'left', paddingTop : '5%'}}> 
				    	<div style={{width : '80%', margin : '0 auto'}}>

				    		<h3 style={{textAlign : 'center'}}>Control</h3>
					    	<Select
					    		onChange={this.setControl}
					    		options={policyStore.getMeasures()}
					    	/>

				    		<h3 style={{textAlign : 'center'}}>Treatment Year</h3>
					    	<Select
					    		disabled={this.state.dataset === undefined}
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		style={{marginTop : 20}}
					    		disabled={this.state.treatmentYear === undefined}
					    	>
					    		Run Difference in Differences
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