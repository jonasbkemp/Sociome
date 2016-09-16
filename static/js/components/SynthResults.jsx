import React from 'react';
import {BarChart, Bar, Line, ResponsiveContainer, CartesianGrid,
		Tooltip, XAxis, YAxis, Legend, LineChart} from 'recharts';

var _ = require('underscore');

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

		return(
			<div style={{width : '70%', height : '100%', paddingTop : '10%'}}>
				<ResponsiveContainer  width='90%' height='40%'>
					<LineChart data={data}>
						<Line type="monotone" dataKey="treated" stroke="#8884d8" activeDot={{r:8}}/>
						<Line type="monotone" dataKey="synthetic" stroke="#82ca9d"/>
						<Tooltip/>
						<Legend/>
						<XAxis dataKey="name" label="Time"/>
						<YAxis/>
						<CartesianGrid strokeDasharray="3 3"/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		)

		/*
		var data = []
		for(var i = 0; i < this.props.states.length; i++){
			var obj = {name : this.props.states[i].label, synth : this.props.results ? this.props.results[i] : 0.0}
			data.push(obj);
		}

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