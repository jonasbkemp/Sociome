import React, {Component} from 'react';
import {Row, Jumbotron} from 'react-bootstrap';


export default class Privacy extends Component{
	render(){
		return(
			<div class="container">
				<Row>
					<Jumbotron>
					    <h1>Privacy</h1>
					    <p>
					    	Privacy information goes here.
					    </p>
					</Jumbotron>
				</Row>
			</div>
		);
	}
}