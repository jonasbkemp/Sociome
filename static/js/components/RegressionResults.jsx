import React from 'react';

import {ScatterChart, Line, Legend, CartesianGrid, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip} from 'recharts';

export default class RegressionResults extends React.Component{
	constructor(props){
		super(props);
	}

	scatterPlotData = () => {
		var data = [];
		var values = this.props.results.values;
		for(var i = 0; i < values.dependent.length; i++){
			data.push({independent : values.independent[i], dependent : values.dependent[i]});
		}
		return(data);
	}

	regressionLine = () => {
		var data = [];
		var values = this.props.results.values;
		var coefficients = this.props.results.coefficients;
		console.log(this.props.results)
		for(var i = 0; i < values.independent.length; i++){
			data.push({
				independent : values.independent[i],
				dependent : coefficients.independent * values.independent[i] + coefficients['(Intercept)']
			})
		}
		return data;
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




