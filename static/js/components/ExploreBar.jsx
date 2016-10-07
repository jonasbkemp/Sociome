import React from 'react';
import Select from 'react-select';
import * as _ from 'lodash';
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
									<li key={ds}><a href="#">{ds}</a></li>
								)
							}
					        </ul>
						</li>
						{
							this.state.categories.map((opt) => 
								<li class="dropdown" key={opt}>
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
										{opt}
									</a>
									<ul class="dropdown-menu">
							            {
							            	_.range(3).map((v) => 
							            		<li key={v}><a href="#">
							            			<p
							            				style={{
							            					fontFamily : 'Avenir-Light, Avenir Light, Avenir Book, Avenir',
							            					fontWeight : 200,
							            					fontSize : '12px',
							            					textAlign : 'left',
							            				}}
							            			>
							            				{`Dropdown ${v}`}
							            			</p>
							            		</a></li>
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
	}
}

