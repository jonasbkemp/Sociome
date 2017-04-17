import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, browserHistory, IndexRedirect} from 'react-router';
require('react-select/dist/react-select.css');
import {Explore, Regression, Download} from './pages'
import Layout from './Layout'

const app = document.getElementById('app');

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/explore"/>
			<Route path="explore" component={Explore}/>
			<Route path="regression" component={Regression}/>
      <route path="download" component={Download}/>
		</Route>
	</Router>,
	app
);