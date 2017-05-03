/**
 * Difference in Differences page
 * @flow
 */

import React from 'react';
import DiffInDiffResults from '../components/DiffInDiffResults';
import * as AnalysisActions from '../actions/AnalysisActions'
import Select from 'react-select'
import {Button} from 'react-bootstrap'
import {connect} from 'react-redux'

import type {Action} from '../actions/Types'
import type {State} from '../Store'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux'

class DiffInDiff extends React.Component<*,*,*>{
	constructor(props){
		super(props);
		this.state = {
			policy : null,
			outcome : null,
			results : null
		}
	}

	generateModel = () => {
		const args = {
			outcome : this.state.outcome,
			policy : this.state.policy,
		}
		this.props.diffInDiff(args)
			.then(results => {
				this.setState({...this.state, results : results})
			})
	}

	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}} class='container-fluid'>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<div class='row' style={{marginBottom : 10, marginTop : 100}}>
				    			<div class='col-xs-10 col-xs-offset-1'>
						    		<Select
						    			placeholder='Policy'
						    			onChange={policy => this.setState({...this.state, policy})}
						    			options={this.props.vars.policy}
						    			value={this.state.policy}
						    		/>
					    		</div>
				    		</div>
				    		<div class='row' style={{marginBottom : 10}}>
				    			<div class='col-xs-10 col-xs-offset-1'>
						    		<Select
						    			placeholder='Outcome'
						    			onChange={outcome => this.setState({...this.state, outcome})}
						    			options={this.props.vars.outcomes}
						    			value={this.state.outcome}
						    		/>
					    		</div>
				    		</div>
				    		<div class='row'>
				    			<div class='col-xs-8 col-xs-offset-2'>
				    				<Button 
				    					bsStyle='primary' 
				    					onClick={this.generateModel} 
				    					disabled={this.state.policy == null || this.state.outcome == null}
				    				>
				    					Generate Model
				    				</Button>
				    			</div>
				    		</div>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%', height : 400}}>
					    		<DiffInDiffResults 
					    			policy={this.state.policy}
					    			outcome={this.state.outcome}
					    			results={this.state.results}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

const mapStateToProps : MapStateToProps<State,*,*> = state => ({
	vars : state.diffInDiff
})
const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({
	diffInDiff : args => dispatch(AnalysisActions.diffInDiff(args))
})

export default connect(mapStateToProps, mapDispatchToProps)(DiffInDiff);