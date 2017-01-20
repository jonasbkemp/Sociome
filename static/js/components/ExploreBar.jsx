import React from 'react';
import * as _ from 'lodash';
import * as BS from 'react-bootstrap';
import DataStore from '../stores/DataStore';
import * as DataActions from '../actions/DataActions';

export default class ExploreBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			datasets : DataStore.getDatasets(),
			whichDataset : undefined,
			categories : [],
		}
	}

	changeDataset = () => {
		this.setState(_.extend({}, this.state, {
			whichDataset : DataStore.getCurrentDataset(),
			categories : DataStore.getCategories(),
		}))
	}

	changeSubCategory = () => {
		this.setState(_.extend({}, this.state, {
			whichSubCategory : DataStore.getCurrentSubCategory(),
		}))
	}

	componentWillMount(){
		console.log('adding listeners')
		DataStore.on('change-dataset', this.changeDataset);
		DataStore.on('change-sub-category', this.changeSubCategory);
	}

	coponentWillUnmount(){
		console.log('Unmounting ExploreBar')
		DataStore.removeListener('change-dataset', this.changeDataset);
		DataStore.removeListener('change-sub-category', this.changeSubCategory);
	}

	selectDS = dataset => {
		console.log('Selecting data set')
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
							this.state.whichDataset === 'Policy' ? 
								this.state.categories.map((category) => 
									<BS.NavDropdown 
										style={{fontSize : 11}}
										id='policy-dropdown' 
										key={category.value}
										onSelect={this.selectSubCategory(category.value)} 
										title={category.label}
									>
									{
										DataStore.getSubCategories(category.value).map(v => 
											<BS.MenuItem key={v.value} eventKey={v.value} style={{fontSize : 11}}>
												{v.label}
											</BS.MenuItem>
										)
									}
									</BS.NavDropdown>									
								) : 
								this.state.categories.map((category) => 
									<BS.MenuItem 
										style={{fontSize : 11}}
										key={category.value}
										id={category.value}
										onClick={this.selectCategory}
									>
										{category.label}
									</BS.MenuItem>
								)
						}
					</ul>
				</div>
			</nav>
		)
	}
}

