/**
 * Difference in Differences Results
 * @flow
 */
import React from 'react';
import {
	BarChart, 
	Bar, 
	Line, 
	ResponsiveContainer, 
	CartesianGrid,
	Tooltip, 
	XAxis, 
	YAxis, 
	Legend, 
	LineChart, 
	ReferenceLine
} from 'recharts';

type Props = {
	results : ?{
		A : number,
		B : number,
		C : number,
		D : number
	}
}

export default class DiffInDiffResults extends React.Component<*,Props,*>{
	//Recharts has an annoying flicker without this
	shouldComponentUpdate(nextProps : Props){
		return this.props.results != nextProps.results;
	}

	render(){
		var data = [];
		if(this.props.results){
			const results = this.props.results;
			data.push({'Treatment Group' : results.C, 'Non-Treatment Group' : results.A, period : 'Pre-exposure'})
			data.push({period : 'Year of Treatment'})
			data.push({'Treatment Group' : results.D, 'Non-Treatment Group' : results.B, period : 'Post-exposure'})
		}


		return(
			<div style={{width : '100%', height : '100%', paddingTop : '10%'}}>
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
		)
	}
}