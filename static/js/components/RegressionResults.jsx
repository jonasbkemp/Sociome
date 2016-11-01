import React from 'react';

import {ScatterChart, Line, Legend, CartesianGrid, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip} from 'recharts';

export default class RegressionResults extends React.Component{
	constructor(props){
		super(props);
	}

	scatterPlotData = () => {
		var data = [];
		var model = this.props.results.model;
		for(var i = 0; i < model.dependent.length; i++){
			data.push({independent : model.independent[i], dependent : model.dependent[i]});
		}
		return(data);
	}

	regressionLine = () => {
		var data = [];
		var model = this.props.results.model;
		var coefficients = this.props.results.coefficients;
		for(var i = 0; i < model.independent.length; i++){
			data.push({
				independent : model.independent[i],
				dependent : coefficients.independent * model.independent[i] + coefficients['(Intercept)']
			})
		}
		return data;
	}

	render(){
		return(
			this.props.results ? 
			<div style={{position : 'absolute', width : '70%', height : '50%', right : 0, paddingTop : '5%'}}> 
		    	<ResponsiveContainer  width='90%' height='100%'>
					<ScatterChart>
						<XAxis 
							label={this.props.independent.label} 
							dataKey='independent' 
							name={this.props.independent.value}
							domain={['dataMin', 'dataMax']}
						/>
						<YAxis label={this.props.dependent.label} dataKey='dependent' name={this.props.dependent.value}/>
						<CartesianGrid/>
						<Tooltip/>
						<Scatter data={this.scatterPlotData()} fill='#8884d8'/>
						<Scatter 
							data={this.regressionLine()} 
							line={{strokeWidth : 2}} 
							shape={() => <div></div>} 
							fill='#82ca9d'
						/>
					</ScatterChart>
				</ResponsiveContainer>
		    </div> : null
		)
	}

}