import React, {Component} from 'react';
import ExploreBar from 'sociome/components/ExploreBar';

//import Map from 'sociome/components/Map';
//import PolicyMenu from 'sociome/components/PolicyMenu';

export default class Explore extends Component{
	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<ExploreBar style={{height : '60px'}}/>
				{/*
			 	<div style={{position : 'relative', bottom : 0, width : '20%', float : 'left'}}> 
			    	<PolicyMenu/>
			    </div>
			    <div style={{position : 'relative', bottom : 0, marginLeft : '20%'}}> 
			    	<Map/>
			    </div>*/}
			</div>
		)
	}
}