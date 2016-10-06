import React from 'react';
import Select from 'react-select';
import * as _ from 'underscore';
import * as BS from 'react-bootstrap';

export default class ExploreBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			datasets : ['Policy', 'Health Outcomes', 'Demographics'],
			categories : [
				'Health',
				'Education',
				'Tobacco & Drugs',
				'Guns',
				'Justice & Equality',
			 	'Consumer',
				'Labor',
				'Environment',
				'Infrastructure',
				'Economy'
			]
		}
	}

	render(){
		return(
			<nav class="navbar navbar-default">
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
									<li><a href="#">{ds}</a></li>
								)
							}
					        </ul>
						</li>
						{
							this.state.categories.map((opt) => 
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
											fontSize : '12px',
										}}
									>
										<span class="caret"></span>
										{opt}
									</a>
									<ul class="dropdown-menu">
							            {
							            	_.range(3).map((v) => 
							            		<li><a href="#">{`Dropdown ${v}`}</a></li>
							            	)
							            }
							        </ul>
								</li>
							)
						}
					</ul>
				</div>
			</nav>




		)
		/*
		return(
			<div style={_.extend(this.props.style, {display : 'table'})}>
				<div 
					style={{
						display : 'table-cell', 
						height : '100%', 
						backgroundColor : 'rgba(242, 242, 242, 1)'
					}}
				>
					<BS.NavDropdown
						title={
							<p
								style={{
									fontFamily : 'Avenir-Light,Avenir Light,Avenir Book,Avenir',
									fontWeight : 200,
									fontSize : '16px',
								}}
							>
								Policy Data
							</p>
						}
					>
					</BS.NavDropdown>
				</div>
			</div>
		)*/
	}
}

