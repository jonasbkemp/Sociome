import React from 'react';
import {DropTarget} from 'react-dnd';

class VariableBox extends React.Component{
	render(){
		return this.props.connectDropTarget(
			<div 
				style={_.extend(this.props.style, {
					height : '12rem',
					width : '18rem',
					backgroundColor : 'rgb(204,204,204)',
					overflow : 'scroll',
					borderRadius : 20,
					paddingBottom : 10,
					position : 'relative',
				})}
			>
			{
				this.props.items.map(i => 
					<div key={i.value} style={{marginLeft : 5}}>
						<p>
							{i.label} ({i.year})
						</p>
					</div>
				)
			}
			{
				this.props.items.length == 0 ? 
				<div 
					style={{
						position : 'absolute', 
						top: '50%', 
						left : '50%', 
						transform : 'translate(-50%, -50%)',
						color : 'white'
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

