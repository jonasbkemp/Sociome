import React from 'react';
import * as BS from 'react-bootstrap';
import * as DataActions from '../actions/DataActions';
import {connect} from 'react-redux'

class ExploreBar extends React.Component{
	selectDS = dataset => {
		this.props.setDataset(dataset);
	}

	selectCategory = (event) => {
		event.target.blur()
		this.props.setCategory(event.target.id);
	}

	selectSubCategory = category => subCategory => {
		this.props.setSubCategory(category, subCategory);
	}

	render(){
		return(
			<nav class="navbar navbar-default" style={{marginBottom : 0}}>
				<div class="container-fluid">
					<ul class="nav navbar-nav">
						<BS.NavDropdown id='dataset-dropdown' onSelect={this.selectDS} title="Dataset">
						{
							this.props.data.datasets.map(ds => 
								<BS.MenuItem key={ds.value} eventKey={ds} >{ds.label}</BS.MenuItem>
							)
						}
						</BS.NavDropdown>
						{
							this.props.data.currentDataset && this.props.data.currentDataset.value === 'policy' ? 
								Object.keys(this.props.data.categories).map(category => 
									<BS.NavDropdown 
										style={{fontSize : 11}}
										id='policy-dropdown' 
										key={category}
										onSelect={this.selectSubCategory(category)} 
										title={category}
									>
									{
										Object.keys(this.props.data.categories[category]).map(v => 
											<BS.MenuItem key={v} eventKey={v} style={{fontSize : 11}}>
												{v}
											</BS.MenuItem>
										)
									}
									</BS.NavDropdown>									
								) : 
								Object.keys(this.props.data.categories).map(category => 
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

const mapDispatchToProps = dispatch => ({
	setDataset : dataset => dispatch(DataActions.setDataset(dataset)),
	setCategory : category => dispatch(DataActions.setCategory(category)),
	setSubCategory : (category, subCategory) => dispatch(DataActions.setSubCategory(category, subCategory))
})

const mapStateToProps = state => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ExploreBar)
