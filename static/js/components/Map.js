import d3 from 'd3';
import Datamap from 'datamaps/dist/datamaps.usa.min'
import React, {Component} from 'react';


export default class Map extends Component{

	drawMap(){
		var map = new Datamap({
			element : this.refs.container,
			responsive : true,
			scope : 'usa',

		})
		this.map = map;
	}

	componentWillReceiveProps() {
		this.clear();
	}

	clear = () => {
		const container = this.refs.container;

		for (const child of Array.from(container.childNodes)) {
			container.removeChild(child);
		}
	}

	componentDidMount(){
		this.drawMap();
	}
	componentDidUpdate(){
		this.drawMap();
	}

	render(){

		return(
			<div style={styles.map} ref='container'></div>
		)
	}
}

const styles={
	map : {
		position : 'absolute',
		top : 0,
		left : 0,
		width : '100%',
		height : '100%',
	},
}