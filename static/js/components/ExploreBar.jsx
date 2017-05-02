/**
 * @flow
 */

import React from 'react';
import * as BS from 'react-bootstrap';
import * as DataActions from '../actions/DataActions';
import {connect} from 'react-redux'
import store from '../Store'

import type {Action, Select_t} from '../actions/Types'
import type {State} from '../Store'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux' 
import type {DataState} from '../reducers/DataReducer'

type Props = {
	data : DataState,
	style : Object
}

export default class ExploreBar extends React.Component<*,Props,*>{
	selectDS = (dataset : Select_t) => {
		store.dispatch(DataActions.setDataset(dataset))
	}

	selectCategory = (category : Select_t) => (event : any) => {
		event.target.blur()
		store.dispatch(DataActions.setCategory(category))
	}

	selectSubCategory = (subCategory : Select_t) => {
		store.dispatch(DataActions.setSubCategory(subCategory));
	}

	render(){
		const [selectedDataset, selectedCategory, ...rest] = this.props.data.selected;
		const datasets = this.props.data.datasets

		var children;
		if(selectedDataset){
			if(selectedDataset.value === 'policy'){
				var dropdownChildren;
				if(selectedCategory){
					dropdownChildren = Object.keys(selectedCategory.children).map(subCategory => 
						<BS.MenuItem 
							eventKey={{value : subCategory, label : subCategory}} 
							key={subCategory}
							style={{fontSize : 11}}
						>
							{subCategory}
						</BS.MenuItem>
					)
				}
				children = Object.keys(selectedDataset.children).map(category =>
					<BS.NavDropdown
						onSelect={this.selectSubCategory}
						style={{fontSize : 11}}
						id='policy-dropdown'
						key={category}
						onClick={this.selectCategory({value : category, label : category})}
						title={category}
					>
						{dropdownChildren}
					</BS.NavDropdown>
				)
			}else{
				children = Object.keys(selectedDataset.children).map(category => 
					<BS.MenuItem
						style={{fontSize : 11}}
						key={category}
						id={category}
						onClick={this.selectCategory({value : category, label : category})}
					>
						{category}
					</BS.MenuItem>
				)
			}
		}

		return(
			<div style={this.props.style}>
				<nav class="navbar navbar-default" style={{...this.props.style, marginBottom : 0}}>
					<div class="container-fluid">
						<ul class="nav navbar-nav">
							<BS.NavDropdown id='dataset-dropdown' onSelect={this.selectDS} title="Dataset">
							{
								Object.keys(datasets).map(dsKey => 
									<BS.MenuItem 
										key={dsKey} 
										eventKey={{value : dsKey, label : datasets[dsKey].label}} 
									>
										{datasets[dsKey].label}
									</BS.MenuItem>
								)
							}
							</BS.NavDropdown>
							{children}
						</ul>
					</div>
				</nav>
			</div>
		)
	}
}