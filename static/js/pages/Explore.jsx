import React, {Component} from 'react';
import ExploreBar from 'sociome/components/ExploreBar';
import ZoomMap from 'sociome/components/ZoomMap';
import * as _ from 'lodash';
import FieldMenu from 'sociome/components/FieldMenu';
import DataStore from 'sociome/stores/DataStore';

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';

export default class Explore extends Component{
	constructor(props){
		super(props);
		this.state = {
			data : undefined
		}
	}

	updateData = () => {
		this.setState(_.extend({}, this.state, {data : DataStore.getData()}));
	}

	componentWillMount(){
		DataStore.on('change-data', this.updateData);
		DataStore.on('change-year', this.updateData);
	}

	componentWillUnmount(){
		DataStore.removeListener('change-data', this.updateData);
		DataStore.removeListener('change-year', this.updateData);
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<ExploreBar style={{height : '60px'}}/>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<FieldMenu/>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%'}}>
					    		<ZoomMap 
					    			style={{width : '100%'}}
					    			data={this.state.data} 
					    			dataset={this.state.data && this.state.data.length > 100 ? 'health-outcomes' : 'policy'}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}