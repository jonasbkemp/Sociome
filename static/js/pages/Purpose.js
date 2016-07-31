import React, {Component} from 'react';
import {Row, Jumbotron} from 'react-bootstrap';


export default class Purpose extends Component{
	render(){
		return(
			<div class="container">
				<Row>
					<Jumbotron>
					    <h1>Purpose</h1>
					    <p>
					    	Purpose information goes here
					    </p>
					</Jumbotron>
				</Row>
			</div>
		);
	}
}