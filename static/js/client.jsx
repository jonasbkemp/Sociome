import React from "react";
import ReactDOM from "react-dom";
require('react-select/dist/react-select.css');
import {Explore, Regression, Download, DiffInDiff} from './pages'
import Layout from './Layout'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
 
const app = document.getElementById('app');

const routes = [
	{
		path : '/',
		component : Explore,
		exact : true
	},
	{
		path : '/regression',
		component : Regression
	},
	{
		path : '/download',
		component : Download
	},
	{
		path : '/diff-in-diff',
		component : DiffInDiff
	}
]

ReactDOM.render(
	<Router>
	<div>
	{
		routes.map(({path, component : Comp, exact}) => 
			<Route
				key={path}
				path={path}
				exact={exact}
				render={props => (
					<Layout {...props}>
						<Comp {...props} />
					</Layout>
				)}
			/>
		)
	}
	</div>
	</Router>, app)