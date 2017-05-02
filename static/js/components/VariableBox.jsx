/**
 * Variable Box component
 * @flow
 */
import React from 'react';
import {DropTarget} from 'react-dnd';

class VariableBox extends React.Component{
	render(){
		return this.props.connectDropTarget(
			<div 
				style={{
					...this.props.style, 
					height : '12rem',
					width : '100%',
					backgroundColor : 'rgb(204,204,204)',
					overflow : 'scroll',
					borderRadius : 20,
					paddingBottom : 10,
					position : 'relative',
				}}
			>
			{
				this.props.items.map(i => 
					<div key={i.value} style={{marginLeft : 5}}>
						<p>
							{i.label} {this.props.noYears ? '' : `(${i.year})`}
						</p>
					</div>
				)
			}
			{
				this.props.items.length == 0 ? 
				<div 
					style={{
						display : 'flex',
						justifyContent : 'center',
						alignItems : 'center',
						color : 'white',
						height : '100%'
					}}
				>
					{this.props.label}
				</div> : null
			}
			</div>
		)
	}
}

const types = props => props.accepts;
const spec = {
	drop : (props, monitor) => {
		props.onDrop(monitor.getItem())
	}
}
const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
  	isOver: monitor.isOver(),
  	canDrop: monitor.canDrop()
})

export default DropTarget(types, spec, collect)(VariableBox);

