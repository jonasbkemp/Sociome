import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, hashHistory, IndexRedirect} from 'react-router';

import Layout from 'sociome/Layout';
import Explore from 'sociome/pages/Explore';
import Privacy from 'sociome/pages/Privacy';
import Contact from 'sociome/pages/Contact';
import Purpose from 'sociome/pages/Purpose';
import CompareData from 'sociome/pages/CompareData';
import Sandbox from 'sociome/pages/Sandbox';
import DiffInDiff from 'sociome/pages/DiffInDiff';

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
