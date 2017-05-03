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
	},
	policy : ?{
		value : string,
		label : string,
		dataset : string
	},
	outcome : ?{
		value : string,
		label : string,
		description : string,
		dataset : string
	}
}

function splitText(text){
	const N = text.length;
	const words = text.split(' ');
	var sum = 0;
	const lens = words.map(x => {
		sum += x.length;
		return sum+x.length
	});

	for(var i = 0; i < words.length; i++){
		if(lens[i] > N/2){
			var firstLine = words.slice(0, i).join(' ')
			var secondLine = words.slice(i).join(' ')
			return [
				<tspan key={1} x="0.5" dy="1.2em">{firstLine}</tspan>,
				<tspan key={2} x="0.5" dy="1.2em">{secondLine}</tspan>
			]
		}
	}

}

const AxisLabel = ({ axisType, x, y, width, height, stroke, text }) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + (width / 2);
  const cy = isVert ? (height / 2) + y : y + height + 10;
  var rot = isVert ? `270 ${cx} ${cy}` : 0;

  var children = text;
  if(children.length > 50){
  	children = splitText(children);
  	rot = isVert ? `270 0 ${cy}` : 0;
  }

  return (
    <text x={cx} y={cy} transform={`rotate(${rot})`} textAnchor="middle" stroke='none' fill='rgb(102, 102, 102)'>
      {children}
    </text>
  );
};

export default class DiffInDiffResults extends React.Component<*,Props,*>{
	//Recharts has an annoying flicker without this
	shouldComponentUpdate(nextProps : Props){
		return this.props.results != nextProps.results;
	}

	render(){
		if(this.props.results == null)
			return null;

		const outcome = this.props.outcome || {}

		var data = [];
		const results = this.props.results;
		data.push({'Treatment Group' : results.C, 'Non-Treatment Group' : results.A, period : 'Pre-exposure'})
		data.push({period : 'Year of Treatment'})
		data.push({'Treatment Group' : results.D, 'Non-Treatment Group' : results.B, period : 'Post-exposure'})

		return(
			<div style={{width : '100%', height : '100%', marginTop : 50}}>
				<ResponsiveContainer  width='90%' height={400}>
					<LineChart data={data} margin={{top : 20, left : 30}} >
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
						<XAxis padding={{left:50, right : 50}} dataKey="period"/>
						<YAxis label={<AxisLabel axisType='yAxis' text={outcome.description} />}/>
						<ReferenceLine x="Year of Treatment" stroke='black'/>
						<CartesianGrid strokeDasharray="3 3"/>\
					</LineChart>
				</ResponsiveContainer>
			</div>
		)
	}
}


