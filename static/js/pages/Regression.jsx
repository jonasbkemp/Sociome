import React from 'react';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {policyStore} from 'sociome/stores/DataStore';
import {states} from 'sociome/data/StateCodes';
import {ScatterChart, Line, Legend, CartesianGrid, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer, Tooltip} from 'recharts';
var _ = require('underscore')

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';
		
export default class Regression extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			predVar : {},
			depVar : {},
		}
	}

	regress = (event) => {
		var url = `${BACKEND_URL}/LinRegression?predVar=${this.state.predVar.value}&depVar=${this.state.depVar.value}`
		console.log(url)
		$.get(url, (res) => {
			console.log(res)
			this.setState(_.extend({}, this.state, {results : res}))
		})
	}

	setPredVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				predVars : {},
				depVar : {},
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {predVar : event, results : undefined}))
		}
	}

	setDepVar = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {
				depVar : {},
				results : undefined,
			}))
		}else{
			this.setState(_.extend({}, this.state, {depVar: event, results : undefined}))
		}
	}

	render(){
		var scatterData = []
		var regressionLine = []
		if(this.state.results){
			var xRange = [Number.MAX_VALUE, Number.MIN_VALUE];
			var points = this.state.results.data;
			for(var i = 0; i < points.length; i++){
				scatterData.push({x : points[i][this.state.predVar.value], y : points[i][this.state.depVar.value]});
				xRange[0] = Math.min(xRange[0], points[i][this.state.predVar.value])
				xRange[1] = Math.max(xRange[1], points[i][this.state.predVar.value])
			}			
			var rfun = this.state.results.regression
			regressionLine.push({x : xRange[0], y : xRange[0] * rfun.m + rfun.b})
			regressionLine.push({x : xRange[1], y : xRange[1] * rfun.m + rfun.b})
		}
		return(
			<div style={{position : 'absolute', width : '100%', height : '100%'}}>
				<h1 style={{textAlign : 'center'}}>Regression</h1>
				<div style={{position : 'relative', width : "100%", height : '100%', overflow: "scroll"}}>
				    <div style={{position : 'absolute', width : '30%', left : 0, paddingTop : '5%'}}> 
				    	<div style={{width : '80%', margin : '0 auto'}}>
				    		<h3 style={{textAlign : 'center'}}>Predictor Variable</h3>
					    	<Select
					    		onChange={this.setPredVar}
					    		options={policyStore.getPolicyFields('a_fiscal_11')}
					    		value={this.state.predVar}
					    		tabSelectsValue={false}
					    	/>
					    	<h3 style={{textAlign : 'center'}}>Dependent Variable</h3>
					    	<Select
					    		onChange={this.setDepVar}
					    		options={policyStore.getMeasures()}
					    		value={this.state.depVar}
					    		disabled={this.state.predVar === undefined}
					    		tabSelectsValue={false}
					    	/>
					    	<Button 
					    		bsStyle='primary' 
					    		onClick={this.regress} 
					    		style={{marginTop : 20}}
					    		disabled={this.state.depVar === undefined}
					    	>
					    		Run Regression
					    	</Button>
					    	{/*Add some spacing at the bottom to account for the dropdown of the last menu*/}
					    	<div style={{height : 120}}></div>
				    	</div>
				    </div>
				    <div style={{position : 'absolute', width : '70%', height : '50%', right : 0, paddingTop : '5%'}}> 
				    	<ResponsiveContainer  width='90%' height='100%'>
							<ScatterChart>
								<XAxis label={this.state.predVar.label} dataKey='x' name={this.state.predVar.value}/>
								<YAxis label={this.state.depVar.label} dataKey='y' name={this.state.depVar.value}/>
								<CartesianGrid/>
								<Tooltip/>
								<Scatter data={scatterData} fill='#8884d8'/>
								<Scatter data={regressionLine} line={{strokeWidth : 2}} shape={() => <div></div>} fill='#82ca9d'/>
							</ScatterChart>
						</ResponsiveContainer>
				    </div>
				</div>
			</div>
		)
	}
}