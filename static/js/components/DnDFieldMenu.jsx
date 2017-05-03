/**
 * Drag and Drop Field Menu component
 * @flow
 */

import React from 'react';
import DraggableLabel from '../components/DraggableLabel'
import {connect} from 'react-redux'
import Dropbox from '../components/Dropbox'

import type {Action} from '../actions/Types'
import type {State} from '../Store'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux' 

class DnDFieldMenu extends React.Component{
	render(){
		return(
			<div style={{marginTop : 50}}>
				<div class='row'>
					<div class="col-xs-10 col-xs-offset-1">
					{
						this.props.fields.map((f, i) => 
							<DraggableLabel
								type="field"
								key={f.value}
								noYears={this.props.noYears}
								{...f}
							/>
						)
					}
					</div>
				</div>
				<div class='row'>
					<div class="col-xs-10 col-xs-offset-1">
					{
						this.props.bins.map((b, i) => 
							<Dropbox
								key={i}
								{...b}
								noYears={this.props.noYears}
								style={{marginBottom : 10, width : '100%'}}
							/>
						)
					}
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps : MapStateToProps<State,*,*> = state => state.data
const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DnDFieldMenu)