import React from 'react';

var _ = require('underscore');

export default class SynthResults extends React.Component{



	render(){
		var zipped = _.zip(this.props.states, this.props.results)
		var results = zipped.map((x) => x[0].label + ': ' + x[1] + '\n')
		return(
			<div>
				<h5>Results</h5>
				{
					results.map((x, i) => 
						<div key={i}>
							{x}
							<br/>
						</div>				
					)
				}
			</div>
		)
	}
}