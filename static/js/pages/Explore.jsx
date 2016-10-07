import React, {Component} from 'react';
import ExploreBar from 'sociome/components/ExploreBar';
import ZoomMap from 'sociome/components/ZoomMap';
import * as _ from 'lodash';

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';

export default class Explore extends Component{
	constructor(props){
		super(props);
		this.state = {
			data : undefined
		}

		var url = `${BACKEND_URL}/GetHealthOutcomes?measure_name=adult_obesity&year=2008`;
		//var url = `${BACKEND_URL}/GetPolicyData?policy=a_fiscal_11&field=apolspt&year=1957`;

		$.get(url)
			.done((data) => {	
				setTimeout(() => this.setState(_.extend({}, this.state, {data : data})), 1000)
			}).fail((err) => {
				console.log('Error: ' + err)
			})

	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<ExploreBar style={{height : '60px'}}/>

				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%'}}>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%'}}>
					    		<ZoomMap 
					    			style={{width : '100%'}}
					    			data={this.state.data} 
					    			dataset={this.state.data && this.state.data.length > 100 ? 'health-outcomes' : 'policy'}
					    		/>
				    		</div>
				    		<div style={{width : '50%', margin : '0 auto', marginTop : 20}}>
				    			<input
				    				type="range"
				    			/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}