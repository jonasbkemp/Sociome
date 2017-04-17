import React from 'react';
import ExploreBar from '../components/ExploreBar';
import DnDFieldMenu from '../components/DnDFieldMenu';
import update from 'react/lib/update';
import RegressionResults from '../components/RegressionResults';
import dispatcher from '../Dispatcher'
import * as AnalysisActions from '../actions/AnalysisActions'

class DiffInDiff extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			bins : [
				{
					accepts : ['field'], 
					items : [], 
					multi : true,
					onDrop : (item) => this.handleDrop(0, item, false),
					label : 'Predictive',
				},
				{
					accepts : ['field'], 
					items : [],
					onDrop : (item) => this.handleDrop(1, item, false),
					label : 'Dependent',
				}
			],
			dropped : {}
		}
	}

	handleDrop = (index, value, multi) => {
		var newState = update(this.state, {
			bins : {
				[index] : {
					items : multi ? {$push : [value]} : {$set : [value]}
				}
			},
			dropped : {
				$merge : {[value.value] : true}
			}
		})
		this.setState(newState);
	}

	generateModel = () => {
		AnalysisActions.linearRegression({
			dependent : this.state.bins[0].items[0],
			independent : this.state.bins[1].items[0],
			controls : this.state.bins[2].items		
		}, result => {
			this.setState({...this.state, results : result})
		})
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<DnDFieldMenu 
				    			generateModel={this.generateModel}
				    			bins={this.state.bins}
				    		/>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%'}}>
					    		<RegressionResults 
					    			results={this.state.results}
					    			dependent={this.state.bins[0].items[0]}
					    			independent={this.state.bins[1].items[0]}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

export default DiffInDiff;