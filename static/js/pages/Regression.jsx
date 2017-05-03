/**
 * Regression page
 * @flow
 */
import React from 'react';
import ExploreBar from '../components/ExploreBar';
import DndFieldMenu from '../components/DnDFieldMenu';
import update from 'immutability-helper';
import RegressionResults from '../components/RegressionResults';
import * as AnalysisActions from '../actions/AnalysisActions'
import {Button} from 'react-bootstrap'
import {connect} from 'react-redux'

import type {Action} from '../actions/Types'
import type {State} from '../Store'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux'

class Regression extends React.Component<*,*,*>{
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
			dropped : {},
			results : null
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
		this.props.linearRegression({
			dependent : this.state.bins[0].items[0],
			independent : this.state.bins[1].items[0],
			controls : this.state.bins[2].items
		}).then(result => {
			this.setState({...this.state, results : result})
		})
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '30%', height : '100%', position : 'absolute'}}>
				    		<DndFieldMenu
				    			generateModel={this.generateModel}
				    			bins={this.state.bins}
				    		/>
				    		<div class='row'>
				    			<div class='col-xs-8 col-xs-offset-2'>
				    				<Button
				    					bsStyle='primary'
				    					disabled={!this.state.bins.slice(0, 2).every(b => b.items.length > 0)}
				    					onClick={this.generateModel}
				    				>
				    					Generate Model
				    				</Button>
				    			</div>
				    		</div>
				    	</div>
				    	<div style={{display : 'table-cell', width : '70%'}}>
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

const mapStateToProps : MapStateToProps<State,*,*> = state => ({})
const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({
	linearRegression : args => dispatch(AnalysisActions.linearRegression(args))
})



export default connect(mapStateToProps, mapDispatchToProps)(Regression);
