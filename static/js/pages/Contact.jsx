import React, {Component} from 'react';
import {Row, Jumbotron} from 'react-bootstrap';


export default class Contact extends Component{
	render(){
		return(
			<div class="container">
				<Row>
					<Jumbotron>
					    <h1>Contact</h1>
					    <p>
					    	Contact information goes here
					    </p>
					</Jumbotron>
				</Row>
			</div>
		);
	}
}