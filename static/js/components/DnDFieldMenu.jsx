import React from 'react';
import {DragSource} from 'react-dnd';
import DataStore from '../stores/DataStore';
import * as _ from 'lodash';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import VariableBox from '../components/VariableBox';
import {Button} from 'react-bootstrap';
import {Container} from 'flux/utils'
import DraggableLabel from '../components/DraggableLabel'

class DnDFieldMenu extends React.Component{
	static getStores(){
		return [DataStore]
	}

	static calculateState(){
		return DataStore.getState()
	}

	render(){
		return(
			<div class='container-fluid' style={{marginTop : 50}}>
				<div class='row'>
					<div class="col-xs-11 col-xs-offset-1">
					{
						this.state.fields.map((f, i) => 
							<DraggableLabel
								type="field"
								key={f.value}
								{...f}
							/>
						)
					}
					</div>
				</div>
				<div class='row'>
					<div class="col-xs-11 col-xs-offset-1">
					{
						this.props.bins.map((b, i) => 
							<VariableBox
								key={i}
								{...b}
								style={{marginBottom : 10}}
							/>
						)
					}
					</div>
				</div>
				<div class='row'>
					<div class="col-xs-11 col-xs-offset-1">
						<Button
							bsStyle="primary"
							disabled={!this.props.bins.slice(0, 2).every(b => b.items.length > 0)}
							onClick={this.props.generateModel}
						>
							Generate Model
						</Button>
					</div>
				</div>
			</div>
		)
	}
}

export default Container.create(DnDFieldMenu)