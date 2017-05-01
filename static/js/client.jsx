/**
 * Client.jsx - Main entry point for the app
 * @flow
 */
import React from "react";
import ReactDOM from "react-dom";
import 'react-select/dist/react-select.css';
import {Explore, Regression, Download, DiffInDiff} from './pages'
import Layout from './Layout'
import {BrowserRouter as Router, Route, Link, Switch} from 'react-router-dom'
import Store from './Store'
import {Provider} from 'react-redux'

import './Init'

const app = document.getElementById('app');

const routes = [
	{
		path : '/',
		component : Explore,
		exact : true
	},
	{
		path : '/regression',
		component : Regression,
		exact : false
	},
	{
		path : '/download',
		component : Download,
		exact : false
	},
	{
		path : '/diff-in-diff',
		component : DiffInDiff,
		exact : false
	}
]

ReactDOM.render(
	<Provider store={Store}>
		<Router>
			<Switch>
				<Layout>
				{
					routes.map(({path, component : Comp, exact}) =>
						<Route
							key={path}
							exact={exact}
							path={path}
							component={Comp}
						/>
					)
				}
				</Layout>
			</Switch>
		</Router>
	</Provider>,
	app
)
