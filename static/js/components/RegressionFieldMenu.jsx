import React from 'react';
import {DragSource} from 'react-dnd';
import DataStore from '../stores/DataStore2';
import * as _ from 'lodash';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import RegressionVariableBox from '../components/RegressionVariableBox';
import {Button} from 'react-bootstrap';
import {Container} from 'flux/utils'

const fieldSource = {
	beginDrag(props, monitor, component){
		return _.extend({}, props, {
			year : component.state.year,
			dataset : DataStore.getState().currentDataset,
		});
	}
};

const collect = (connect, monitor) => ({
	connectDragSource : connect.dragSource(),
	isDragging: monitor.isDragging()
})

class Field_ extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			year : this.props.years && this.props.years.length > 0 ? 
					this.props.years[0] : undefined
		}
	}

	changeYear = (option) => {
		this.setState(_.extend({}, this.state, {year : option.value}))
	}

	render(){
		return this.props.connectDragSource(
			<div class="container-fluid">
				<div style={styles.fieldContainer} class="row">
					<div class="col-xs-7">
						<p>{this.props.label}</p>
					</div>

					<div class="col-xs-5">
						<Select
		    			clearable={false}
		    			placeholder="Year"
		    			style={{height : 20}}
		    			options={this.props.years.map(y => ({value : y, label : y}))}
		    			onChange={this.changeYear}
		    			value={this.state.year}
		    		/>
					</div>
				</div>
			</div>
		)
	}
}

const styles = {
	fieldContainer : {
		display : 'flex',
		justifyContent : 'center',
		alignItems : 'center',
		borderRadius : 5,
		backgroundColor : 'rgb(121,192,183)',
		marginBottom : 5
	}
}

const Field = DragSource(props => props.type, fieldSource, collect)(Field_);

class RegressionFieldMenu extends React.Component{
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
							<Field
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
							<RegressionVariableBox
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

export default Container.create(RegressionFieldMenu)