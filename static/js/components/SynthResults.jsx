import React from 'react';
import {BarChart, Bar, Line, ResponsiveContainer, CartesianGrid,
		Tooltip, XAxis, YAxis, Legend, LineChart} from 'recharts';
import * as _ from 'lodash';

export default class SynthResults extends React.Component{
    constructor(){
    	super();
    	this.state = {}
    }

	render(){

		var data = []
		if(this.props.results){
			for(var i = 0; i < this.props.results.treatedX.length; i++){
				data.push({
					name : this.props.results.treatedX[i],
					treated : this.props.results.treatedY[i],
					synthetic : this.props.results.syntheticY[i]
				})
			}
		}	

		var barData = []
		for(var i = 0; i < this.props.states.length; i++){
			var obj = {name : this.props.states[i].label, synth : this.props.results ? this.props.results.weights[i] : 0.0}
			barData.push(obj);
		}

		return(
			<div style={{width : '100%', height : '70%', paddingTop : '10%'}}>
				<div style={{width : '100%', height : '50%'}}>
					<ResponsiveContainer  width='90%' height='100%'>
						<LineChart data={data}>
							<Line type="monotone" dataKey="treated" stroke="#8884d8" activeDot={{r:8}}/>
							<Line type="monotone" dataKey="synthetic" stroke="#82ca9d" activeDot={{r:8}}/>
							<Tooltip/>
							<Legend/>
							<XAxis dataKey="name" label="Time"/>
							<YAxis/>
							<CartesianGrid strokeDasharray="3 3"/>
						</LineChart>
					</ResponsiveContainer>
				</div>
				<div style={{width : '100%', height : '50%'}}>
					<ResponsiveContainer  width='90%' height='100%'>
						<BarChart data={barData}>
							<Bar key='name' dataKey='synth' fill='#8884d8'/>
							<Tooltip/>
							<XAxis dataKey="name"/>
							<YAxis/>
							<CartesianGrid strokeDasharray="3 3"/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		)

		/*
		

		return(
			<div style={{width : '70%', height : '100%', paddingTop : '10%'}}>
				<ResponsiveContainer  width='90%' height='40%'>
					<BarChart data={data}>
						<Bar key='name' dataKey='synth' fill='#8884d8'/>
						<Tooltip/>
						<XAxis dataKey="name"/>
						<YAxis/>
						<CartesianGrid strokeDasharray="3 3"/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		)*/
	}
}