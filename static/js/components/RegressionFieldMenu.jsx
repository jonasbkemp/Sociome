import React from 'react';
import {DragSource} from 'react-dnd';
import DataStore from '../stores/DataStore';
import * as _ from 'lodash';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import RegressionVariableBox from '../components/RegressionVariableBox';
import update from 'react/lib/update';
import {Button} from 'react-bootstrap';

const fieldSource = {
	beginDrag(props, monitor, component){
		return _.extend({}, props, {
			year : component.state.year,
			dataset : DataStore.getCurrentDataset(),
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

			<div style={{width : '100%', borderRadius : 5, verticalAlign : 'middle', backgroundColor : 'rgb(121,192,183)', marginBottom : 5}}>
		    	<div style={{display : 'inline-block', width : '75%', verticalAlign: 'middle', height : '100%'}}>
		    		<p style={{marginLeft : 5}}>{this.props.label}</p>
		    	</div>
		    	<div style={{display : 'inline-block', width : '25%'}}>
		    		<div style={{width : '100%'}}>
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

const Field = DragSource(props => props.type, fieldSource, collect)(Field_);

export default class RegressionFieldMenu extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			fields : DataStore.getFields(),
			dropped : {},
			bins : []
		}
	}	

	updateFields = () => {
		var fields = DataStore.getFields();
		this.setState(_.extend({}, this.state, {
			fields : fields,
		}))
	}

	componentWillMount(){
		DataStore.on('change-fields', this.updateFields);
	}

	componentWillUnmount(){
		DataStore.removeListener('change-fields', this.updateFields);
	}

	render(){
		return(
			<div style={{position : 'relative', top : '10%', width : '100%', marginLeft : 10}}>
				{
					this.state.fields.map((f, i) => 
						<Field
							type="field"
							key={f.value}
							{...f}
						/>
					)
				}
				<div>
				{
					this.props.bins.map((b, i) => 
						<RegressionVariableBox
							key={i}
							{...b}
							style={{marginBottom : 10}}
						/>
					)
				}
				<Button
					bsStyle="primary"
					disabled={!this.props.bins.slice(0, 2).every(b => b.items.length > 0)}
					onClick={this.props.generateModel}
				>
					Generate Model
				</Button>
				</div>
			</div>
		)
	}
}

