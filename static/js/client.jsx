import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';
require('react-select/dist/react-select.css');

import Layout from './Layout';
import Explore from './pages/Explore';
import Regression from './pages/Regression';
import Download from './pages/Download'

const app = document.getElementById('app');

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/explore"/>
			<Route path="explore" component={Explore}/>
			<Route path="regression" component={Regression}/>
      <route path="download" component={Download}/>
		</Route>
	</Router>,
	app
);