import React from 'react';
import DataStore from '../stores/DataStore2';
import * as _ from 'lodash';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import {Container} from 'flux/utils'

class FieldMenu extends React.Component{
	static getStores(){
		return [DataStore]
	}

	static calculateState(){
		return DataStore.getState()
	}

	mouseEnter = event => {
		var target = event.target;
		while(target.id === ''){
			target = target.parentNode;
		}
		this.setState(_.extend({}, this.state, {highlighted : target.id}));
	}

	mouseLeave = event => {
		this.setState(_.extend({}, this.state, {highlighted : undefined}));
	}

	click = obj => event => {
		DataActions.setLastCategory(obj);
	}

	changeYear = event => {
		event.target.blur();
		DataActions.changeYear(event.target.value);
	}

	render(){
		return(
			<div style={{position : 'relative', top : '20%', width : '100%', marginLeft : 10}}>
				{
					this.state.fields.map((f) => {return(
						<div 
							onMouseEnter={this.mouseEnter}
							onMouseLeave={this.mouseLeave}
							onClick={() => DataActions.setLastCategory(f)}
							key={f.value}
							id={f.value}
							style={{width : '100%', display : 'table', paddingBottom : 5, cursor : 'pointer'}}
						>
							<div style={{
								display : 'table-cell',
								backgroundColor : this.state.highlighted === f.value ? 'gray' : 'lightgray',
								borderRadius : '50%',
								width : '13px',
								height : '13px',
								marginLeft : 5
							}}>
							</div>
							<p 
								key={f.value} 
								style={{display : 'table-cell'}}
							>
								{f.label}
							</p>
						</div>)}
					)
				}
				{
					this.state.fields.length > 0 ? 
					<div>
						<div style={{width : '70%', margin : '0 auto', marginTop : 20}}>
			    			<input
			    				type="range"
			    				min={0}
			    				onChange={this.changeYear}
			    				max={this.state.years.length - 1}
			    				value={this.state.yearIndex}
			    			/>
			    		</div> 
			    		<div>
			    			<p style={{fontSize : 18}} class='text-center'>
			    				Year: {this.state.years[this.state.yearIndex]}
			    			</p>
			    		</div>
			    	</div> : null
	    		}
			</div>
		)
	}
}

export default Container.create(FieldMenu)

const styles = {
	text : {
		fontFamily : 'Avenir-Light, Avenir Light, Avenir Book, Avenir'
	},
	circle : {
		display : 'table-cell',
		backgroundColor : 'lightgray',
		borderRadius : '50%',
		width : '13px',
		height : '13px',
		lineHeight : 1,
		marginLeft : 5,
	}
}