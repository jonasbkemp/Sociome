/**
 * Explore Page
 * @flow
 */

import React, {Component} from 'react';
import ZoomMap from '../components/ZoomMap';
import FieldMenu from '../components/FieldMenu';
import {connect} from 'react-redux'
import ExploreBar from '../components/ExploreBar'

import type {MapDispatchToProps, MapStateToProps} from 'react-redux'
import type {State} from '../Store'
import type {Action} from '../actions/Types'
import type {Dispatch} from 'redux'

class Explore extends Component{
	render(){
		const {yearlyData} = this.props.data
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<ExploreBar data={this.props.data} style={{height : '60px'}}/>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<FieldMenu/>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%'}}>
					    		<ZoomMap
					    			statesGeom={this.props.geo.states}
					    			style={{width : '100%'}}
					    			data={yearlyData}
					    			dataset={yearlyData && yearlyData.length > 100 ? 'health-outcomes' : 'policy'}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

const mapStateToProps : MapStateToProps<State,*,*> = state => state 

const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Explore)
