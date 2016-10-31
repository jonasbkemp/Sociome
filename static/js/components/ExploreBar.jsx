import React from 'react';
import Select from 'react-select';
import * as _ from 'lodash';
import * as BS from 'react-bootstrap';
import DataStore from 'sociome/stores/DataStore';
import * as DataActions from 'sociome/actions/DataActions';

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

	selectDS = (event) => {
		DataActions.setDataset(event.target.id);
	}

	selectCategory = (event) => {
		DataActions.setCategory(event.target.id);
	}

	selectSubCategory = (category) => (event) => {
		DataActions.setSubCategory(category, event.target.id);
	}

	shouldComponentUpdate(){
		return true;
	}

	render(){
		/*
		return(
			<BS.Navbar>
        		<BS.Nav class="pull-right" activeKey={this.state.activeKey} onSelect={this.onSelect}>
        			<BS.NavDropdown id="ds-dropdown" eventKey={1} title="Dataset">
        			{
        				this.state.datasets.map((ds, i) => 
        					<BS.MenuItem eventKey={`1.${i}`} >
        						{ds}
        					</BS.MenuItem>
        				)
        			}
        			</BS.NavDropdown>
        		</BS.Nav>
        	</BS.Navbar>
		);*/

		
		return(
			<nav class="navbar navbar-default" style={{marginBottom : 0}}>
				<div class="container-fluid">
					<ul class="nav navbar-nav">
						<li class="dropdown">
							<BS.SafeAnchor
								href="#"
								class="dropdown-toggle"
								data-toggle='dropdown'
								role='button'
								aria-has-popup={true}
								aria-expanded={false}
								style={{
									fontFamily : 'Avenir-Light,Avenir Light,Avenir Book,Avenir',
									fontWeight : 200,
									fontSize : '16px',
								}}
							>
								<span class="caret"></span>
								Dataset
							</BS.SafeAnchor>
							<ul class="dropdown-menu">
							{
								this.state.datasets.map((ds) => 
									this.state.whichDataset === ds ? 
										<li key={ds} class='active'><BS.SafeAnchor id={ds} href="#">{ds}</BS.SafeAnchor></li> : 
										<li key={ds} onClick={this.selectDS}><BS.SafeAnchor id={ds} href="#">{ds}</BS.SafeAnchor></li>
								)
							}
					        </ul>
						</li>
						{
							this.state.whichDataset === 'Policy' ? 
								this.state.categories.map((category) => 
									<li 
										class="dropdown" 
										key={category.value} 
									>
										<BS.SafeAnchor
											href="#"
											class="dropdown-toggle"
											data-toggle='dropdown'
											role='button'
											aria-has-popup={true}
											aria-expanded={false}
											style={{
												fontFamily : 'Avenir-Light,Avenir Light,Avenir Book,Avenir',
												fontWeight : 200,
												fontSize : '12px',
											}}
										>
											{category.label}
										</BS.SafeAnchor>
										<ul class="dropdown-menu">
								            {
								            	DataStore.getSubCategories(category.value).map((v) => 
								            		<li 
								            			id={v.value} 
								            			key={v.value} 
								            			onClick={this.selectSubCategory(category.value)}
								            			class={this.state.whichSubCategory === v.value ? 'active' : undefined}
								            		>
									            		<BS.SafeAnchor id={v.value} href="#">
									            			<p
									            				id={v.value}
									            				style={{
									            					fontFamily : 'Avenir-Light, Avenir Light, Avenir Book, Avenir',
									            					fontWeight : 200,
									            					fontSize : '12px',
									            					textAlign : 'left',
									            				}}
									            			>
									            				{v.label}
									            			</p>
									            		</BS.SafeAnchor>
								            		</li>
								            	)
								            }
								        </ul>
									</li>
								) : 
								this.state.categories.map((category) => 
									<li id={category.label} key={category.value} onClick={this.selectCategory}>
										<BS.SafeAnchor 
											id={category.label}
											href="#"
											role='button'
											aria-has-popup={true}
											aria-expanded={false}
											style={{
												fontFamily : 'Avenir-Light,Avenir Light,Avenir Book,Avenir',
												fontWeight : 200,
												fontSize : '12px',
											}}
										>
											{category.label}
										</BS.SafeAnchor>
									</li>
								)
						}
					</ul>
				</div>
			</nav>
		)
	}
}

