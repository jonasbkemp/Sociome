import React from 'react';
import VariableBox from '../components/VariableBox';
import DraggableLabel from '../components/DraggableLabel'
import {connect} from 'react-redux'

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
							<VariableBox
								key={i}
								{...b}
								noYears={this.props.noYears}
								style={{marginBottom : 10}}
							/>
						)
					}
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => state.data
const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DnDFieldMenu)