import React from 'react';
import ExploreBar from 'sociome/components/ExploreBar';
import RegressionFieldMenu from 'sociome/components/RegressionFieldMenu';
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import update from 'react/lib/update';
import RegressionResults from 'sociome/components/RegressionResults';
import {BACKEND_URL} from 'sociome/Constants';

class Regression extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			bins : [
				{
					accepts : ['field'], 
					items : [], 
					onDrop : (item) => this.handleDrop(0, item, false),
					label : 'Dependent',
				},
				{
					accepts : ['field'], 
					items : [],
					onDrop : (item) => this.handleDrop(1, item, false),
					label : 'Independent',
				},
				{
					accepts : ['field'], 
					items : [],
					multi : true,
					onDrop : (item) => this.handleDrop(2, item, true),
					label : 'Controls',
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
		var component = this;
		$.post(`${BACKEND_URL}/LinRegression`, {
			dependent : this.state.bins[0].items[0],
			independent : this.state.bins[1].items[0],
			controls : this.state.bins[2].items
		}).done(result => {
			result = JSON.parse(result);
			this.setState(_.extend({}, this.state, {results : result}));
		}).fail(err => {
			console.log(err)
		})
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<RegressionFieldMenu 
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
					    			controls={this.state.bins[2].items}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

export default DragDropContext(HTML5Backend)(Regression);