import React from 'react';
import {BarChart, Bar, Line, ResponsiveContainer, CartesianGrid,
		Tooltip, XAxis, YAxis, Legend, LineChart, ReferenceLine} from 'recharts';
import * as _ from 'lodash';

export default class DiffInDiffResults extends React.Component{
	render(){
		var data = [];
		if(this.props.results){
			data.push({'Treatment Group' : this.props.results.C, 'Non-Treatment Group' : this.props.results.A, period : 'Pre-exposure'})
			data.push({period : 'Year of Treatment'})
			data.push({'Treatment Group' : this.props.results.D, 'Non-Treatment Group' : this.props.results.B, period : 'Post-exposure'})
		}
		return(
			<div style={{width : '100%', height : '70%', paddingTop : '10%'}}>
				<div style={{width : '100%', height : '50%'}}>
					<ResponsiveContainer  width='90%' height='100%'>
						<LineChart data={data}>
							<Line 
								type="monotone" 
								connectNulls={true} 
								dataKey="Treatment Group" 
								stroke="#8884d8" 
								activeDot={{r:8}}
							/>
							<Line 
								type="monotone" 
								connectNulls={true} 
								dataKey="Non-Treatment Group" 
								stroke="#82ca9d" 
								activeDot={{r:8}}
							/>
							<Tooltip/>
							<Legend/>
							<XAxis padding={{left:50, right : 50}} dataKey="period" label="Period"/>
							<YAxis/>
							<ReferenceLine x="Year of Treatment" stroke='black'/>
							<CartesianGrid strokeDasharray="3 3"/>\
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		)
	}
}