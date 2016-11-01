import React, {Component} from 'react';
import ExploreBar from 'sociome/components/ExploreBar';
import ZoomMap from 'sociome/components/ZoomMap';
import * as _ from 'lodash';
import FieldMenu from 'sociome/components/FieldMenu';
import DataStore from 'sociome/stores/DataStore';
import {BACKEND_URL} from 'sociome/Constants';


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
		console.log('Unmounting Explore')
		DataStore.removeListener('change-data', this.updateData);
		DataStore.removeListener('change-year', this.updateData);
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
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