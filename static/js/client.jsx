import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';

import Layout from './Layout';
import Explore from './pages/Explore';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Purpose from './pages/Purpose';
import CompareData from './pages/CompareData';
import Sandbox from './pages/Sandbox';
import DiffInDiff from './pages/DiffInDiff';

const app = document.getElementById('app');

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/" component={Layout}>
			<IndexRedirect to="/explore"/>
			<Route path="explore" component={Explore}/>
			<Route path="compare-data" component={CompareData}/>
			<Route path="privacy" component={Privacy}/>
			<Route path="contact" component={Contact}/>
			<Route path="purpose" component={Purpose}/>
			<Route path="sandbox" component={Sandbox}/>
			<Route path="diff-in-diff" component={DiffInDiff}/>
		</Route>
	</Router>,
	app
);
