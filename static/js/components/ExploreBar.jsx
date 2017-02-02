import React from 'react';
import * as _ from 'lodash';
import * as BS from 'react-bootstrap';
import DataStore from '../stores/DataStore';
import * as DataActions from '../actions/DataActions';
import {Container} from 'flux/utils'

class ExploreBar extends React.Component{
	static getStores(){
		return [DataStore]
	}

	static calculateState(){
		return DataStore.getState()
	}

	selectDS = dataset => {
		DataActions.setDataset(dataset);
	}

	selectCategory = (event) => {
		event.target.blur()
		DataActions.setCategory(event.target.id);
	}

	selectSubCategory = category => subCategory => {
		DataActions.setSubCategory(category, subCategory);
	}

	render(){
		return(
			<nav class="navbar navbar-default" style={{marginBottom : 0}}>
				<div class="container-fluid">
					<ul class="nav navbar-nav">
						<BS.NavDropdown id='dataset-dropdown' onSelect={this.selectDS} title="Dataset">
						{
							this.state.datasets.map(ds => 
								<BS.MenuItem key={ds} eventKey={ds} >{ds}</BS.MenuItem>
							)
						}
						</BS.NavDropdown>
						{
							this.state.currentDataset === 'Policy' ? 
								Object.keys(this.state.categories).map(category => 
									<BS.NavDropdown 
										style={{fontSize : 11}}
										id='policy-dropdown' 
										key={category}
										onSelect={this.selectSubCategory(category)} 
										title={category}
									>
									{
										Object.keys(this.state.categories[category]).map(v => 
											<BS.MenuItem key={v} eventKey={v} style={{fontSize : 11}}>
												{v}
											</BS.MenuItem>
										)
									}
									</BS.NavDropdown>									
								) : 
								Object.keys(this.state.categories).map(category => 
									<BS.MenuItem 
										style={{fontSize : 11}}
										key={category}
										id={category}
										onClick={this.selectCategory}
									>
										{category}
									</BS.MenuItem>
								)
						}
					</ul>
				</div>
			</nav>
		)
	}
}

export default Container.create(ExploreBar)