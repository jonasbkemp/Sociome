import React, {Component} from 'react';
import ExploreBar from '../components/ExploreBar';
import ZoomMap from '../components/ZoomMap';
import * as _ from 'lodash';
import FieldMenu from '../components/FieldMenu';
import DataStore from '../stores/DataStore';
import {Container} from 'flux/utils'

class Explore extends Component{
	static getStores(){
		return [DataStore]
	}

	static calculateState(){
		return {
			data : DataStore.getState().yearlyData
		}
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

export default Container.create(Explore)