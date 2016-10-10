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
		DataStore.on('change-dataset', this.changeDataset);
		DataStore.on('change-sub-category', this.changeSubCategory);
	}

	coponentWillUnmount(){
		DataStore.removeListener('change-dataset', this.changeDataset);
		DataStore.removeListener('change-sub-category', this.changeSubCategory);
	}

	selectDS = (event) => {
		DataActions.setDataset(event.target.id);
	}

	setSubCategory = (event) => {
		DataActions.setSubCategory(event.target.id);
	}

	render(){
		return(
			<nav class="navbar navbar-default" style={{marginBottom : 0}}>
				<div class="container-fluid">
					<ul class="nav navbar-nav">
						<li class="dropdown">
							<a
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
							</a>
							<ul class="dropdown-menu">
							{
								this.state.datasets.map((ds) => 
									this.state.whichDataset === ds ? 
										<li key={ds} class='active'><a id={ds} href="#">{ds}</a></li> : 
										<li key={ds} onClick={this.selectDS}><a id={ds} href="#">{ds}</a></li>
								)
							}
					        </ul>
						</li>
						{
							this.state.whichDataset === 'Policy' || this.state.whichDataset === 'Demographics' ? 
								this.state.categories.map((category) => 
									<li 
										class="dropdown" 
										key={category.value} 
									>
										<a
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
										</a>
										<ul class="dropdown-menu">
								            {
								            	DataStore.getSubCategories(category.value).map((v) => 
								            		<li 
								            			id={v.value} 
								            			key={v.value} 
								            			onClick={this.setSubCategory}
								            			class={this.state.whichSubCategory === v.value ? 'active' : undefined}
								            		>
									            		<a id={v.value} href="#">
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
									            		</a>
								            		</li>
								            	)
								            }
								        </ul>
									</li>
								) : 
								this.state.categories.map((category) => 
									<li key={category.value}>
										<a 
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
										</a>
									</li>
								)
						}
					</ul>
				</div>
			</nav>
		)
	}
}

