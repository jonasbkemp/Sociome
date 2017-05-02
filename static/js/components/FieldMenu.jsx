/**
 * Field Menu component
 * @flow
 */
import React from 'react';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import {connect} from 'react-redux'
import store from '../Store'

import type {State} from '../Store'
import type {Action, Select_t} from '../actions/Types'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux'
import type {DataState} from '../reducers/DataReducer'

type Props = {
	fields : Array<Select_t>,
	years : Array<number>,
	yearIndex : number
}

class FieldMenu extends React.Component<*,*,*>{
	state : {
		highlighted : ?number
	}

	constructor(){
		super();
		this.state = {
			highlighted : null
		}
	}

	mouseEnter = event => {
		var target = event.target;
		while(target.id === ''){
			target = target.parentNode;
		}
		this.setState({...this.state, highlighted : target.id});
	}

	mouseLeave = event => {
		this.setState({...this.state, highlighted : undefined});
	}

	changeYear = event => {
		event.target.blur();
		store.dispatch(DataActions.changeYear(event.target.value));
	}

	render(){

		return(
			<div style={{marginTop : 100, width : '100%', marginLeft : 20}}>
					<div style={{display : 'table', borderSpacing : 10}}>
					{
						this.props.fields.map((f) => (
							<div 
								onMouseEnter={this.mouseEnter}
								onMouseLeave={this.mouseLeave}
								onClick={() => store.dispatch(DataActions.setLastCategory(f))}
								key={f.value}
								id={f.value}
								style={{width : '100%', display : 'table-row', paddingBottom : 5, cursor : 'pointer'}}
							>
								<div style={{height : '100%', display : 'table-cell', verticalAlign : 'middle'}}>
									<div style={{
										backgroundColor : this.state.highlighted === f.value ? 'gray' : 'lightgray',
										borderRadius : '50%',
										width : '13px',
										height : '13px'
									}}>
									</div>
								</div>
								<p 
									key={f.value} 
									style={{display : 'table-cell', textAlign : 'left', verticalAlign : 'middle', lineHeight : 1}}
								>
									{f.label}
								</p>
							</div>
						)
					)
				}
				</div>
				{
					this.props.fields.length > 0 ? 
					<div>
						<div style={{width : '70%', margin : '0 auto', marginTop : 20}}>
			    			<input
			    				type="range"
			    				min={0}
			    				onChange={this.changeYear}
			    				max={this.props.years.length - 1}
			    				value={this.props.yearIndex}
			    			/>
			    		</div> 
			    		<div>
			    			<p style={{fontSize : 18}} class='text-center'>
			    				Year: {this.props.years[this.props.yearIndex]}
			    			</p>
			    		</div>
			    	</div> : null
	    		}
			</div>
		)
	}
}

const mapStateToProps : MapStateToProps<State,Props,DataState> = (state : State) => state.data
const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(FieldMenu)
