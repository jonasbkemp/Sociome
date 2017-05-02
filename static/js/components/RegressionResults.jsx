/**
 * Regression Results
 */
import React from 'react';
import {ScatterChart, Line, Legend, CartesianGrid, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip} from 'recharts';

const SAMPLE_SIZE = 500;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

type Props = {
	results : ?{
		values : {
			independent : Array<number>,
			dependent : Array<number>,
		},
		coefficients : {
			independent : number,
			'(Interecept)' : number
		}
	}
}

export default class RegressionResults extends React.Component{

	props : Props

	scatterPlotDataSample = () : Array<{independent : number, dependent : number}> => {
		var data = [];
		if(this.props.results == null)
			return [];
		var values = this.props.results.values;
		const N = values.independent.length;
		for(var i = 0; i < SAMPLE_SIZE; i++){
			const j = Math.floor(getRandomInt(0, N))
			data.push({independent : values.independent[j], dependent : values.dependent[j]});
		}
		return(data);
	}

	scatterPlotData = () => {
		if(this.props.results == null)
			return [];
		if(this.props.results.values.independent.length > SAMPLE_SIZE){
			return this.scatterPlotDataSample()
		}
		var data = [];
		var values = this.props.results.values;
		for(var i = 0; i < values.dependent.length; i++){
			data.push({independent : values.independent[i], dependent : values.dependent[i]});
		}
		return(data);
	}

	regressionLine = () => {
		if(this.props.results == null){
			return []
		}

		var values = this.props.results.values;
		var coefficients = this.props.results.coefficients;

		const MIN = values.independent.reduce((acc, val) => Math.min(acc, val), Number.MAX_SAFE_INTEGER);
		const MAX = values.independent.reduce((acc, val) => Math.max(acc, val), Number.MIN_SAFE_INTEGER);

		return [
			{
				independent : MIN,
				dependent : coefficients.independent * MIN + coefficients['(Intercept)']
			}, {
				independent : MAX,
				dependent : coefficients.independent * MAX + coefficients['(Intercept)']
			}
		]
	}

	shouldComponentUpdate(nextProps : Props){
		return this.props.results != nextProps.results;
	}

	render(){
		return(
			this.props.results ?
			<div style={{position : 'absolute', width : '70%', height : '50%', right : 0, paddingTop : '5%'}}> 
				{Object.keys(this.props.results.values).length === 2 ?
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
				</ResponsiveContainer> : null
				}

				<div>
					<p>Residual Standard Error: {this.props.results.residualStdErr}</p>
					<p>Multiple R-Squared: {this.props.results.multipleRSquared}</p>
					<p>Adjusted R-Squared: {this.props.results.adjustedRSquared}</p>
					{
						this.props.results.pvalue ? 
						<div>
							<p>P-Values:</p>
							<table style={_.extend(styles.table, styles.cell)}>
								<thead>
									<tr>
										<th style={styles.cell}>Intercept</th>
										<th style={styles.cell}>{this.props.independent.label}</th>
										{
											this.props.controls.map(c => <th style={styles.cell} key={c.value}>{c.label}</th>)
										}
									</tr>
								</thead>
								<tbody>
									<tr>
										<td style={styles.cell}>{this.props.results.pvalue['(Intercept)']}</td>
										<td style={styles.cell}>{this.props.results.pvalue.independent}</td>
										{
											_.range(0, Object.keys(this.props.results.pvalue).length-2).map(i => 
												<td style={styles.cell} key={i}>
													{this.props.results.pvalue['control' + i]}
												</td>
											)
										}
									</tr>
								</tbody>
							</table>
						</div> : null
					}
					<p>Coefficients:</p>
					<table style={_.extend(styles.table, styles.cell)}>
						<thead>
							<tr>
								<th style={styles.cell}>Intercept</th>
								<th style={styles.cell}>{this.props.independent.label}</th>
							{
								this.props.controls.map(c => <th  style={styles.cell} key={c.value}>{c.label}</th>)
							}
							</tr>
						</thead>
						<tbody>
							<tr>
								<td style={styles.cell}>{this.props.results.coefficients['(Intercept)']}</td>
								<td style={styles.cell}>{this.props.results.coefficients.independent}</td>
								{
									_.range(0, Object.keys(this.props.results.coefficients).length-2).map(i => 
										<td style={styles.cell} key={i}>
											{this.props.results.coefficients['control' + i]}
										</td>
									)
								}
							</tr>
						</tbody>
					</table>
				</div>

		    </div> : null
		)
	}
}

const styles = {
	table : {
		borderCollapse : 'collapse',
		borderSpacing : '2px',
	},
	cell : {
		border : '1px solid black',
		padding : '5px',
	}
}




