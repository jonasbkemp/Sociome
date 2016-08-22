var d3 = require('d3')
import Datamap from 'datamaps/dist/datamaps.usa.min'
import React, {Component} from 'react';
import {policyStore} from '../stores/PolicyStore';
var _ = require('underscore')
import {getStateInfo} from '../data/StateCodes'

export default class Map extends Component{

	updatePolicy = () => {
		this.setState(_.extend({}, this.state, {
			currentPolicy : policyStore.getCurrentPolicy(),
			currentPolicyField : policyStore.getCurrentPolicyField(),
			data : policyStore.getData(),
			currentYear : policyStore.getYear(),
		}))
	}
	updateYear = () => {
		this.setState(_.extend({}, this.state, {
			currentYear : policyStore.getYear(),
		}))
	}

	componentWillMount() {
	    policyStore.on('change-field', this.updatePolicy)
	    policyStore.on('change-year', this.updateYear)
	}

	componentWillUnmount () {
	    policyStore.removeListener('change-field', this.updatePolicy)
	    policyStore.removeListener('change-year', this.updateYear)
	}

	constructor(props){
		super(props)
		this.state = {
			currentPolicy : policyStore.getCurrentPolicy(),
			currentPolicyField : policyStore.getCurrentPolicyField(),
			data : policyStore.getData(),
			currentYear : policyStore.getYear()
		}
	}

	drawMap(){
		var mapArgs = {
			element : this.refs.container,
			responsive : true,
			scope : 'usa',
			geographyConfig : {
				borderColor : '#FFFFFF',
			},
			fills : {
				defaultFill : '#ccc',
			}
		}
		if(this.state.currentPolicyField){
			var yearlyData = _.filter(this.state.data, (d) => d.year === this.state.currentYear)
			var rawVals = yearlyData.map((point) => point[this.state.currentPolicyField.code])

	    	var minValue = d3.min(rawVals),
	            maxValue = d3.max(rawVals);

	        var palette = d3.scaleLinear()
					             .domain([minValue,maxValue])
					             .range(["#EFEFFF","#02386F"]); // blue color

			var data = {}
			for(var i = 0; i < yearlyData.length; i++){
				var val = yearlyData[i][this.state.currentPolicyField.code]
				data[getStateInfo(yearlyData[i].state)] = {
					fillColor : palette(val),
					value : val
				}
			}
			mapArgs.data = data;
			mapArgs.geographyConfig = {
				borderColor : '#FFFFFF',
				highlightFillColor: function(geo) {
	                return geo['fillColor'] || '#ccc';
	            },
				popupTemplate: (geo, data) =>
	                ['<div class="hoverinfo">',
	                	'<strong>', geo.properties.name, '</strong>',
	                    '<br><strong>', this.state.currentPolicyField.label ,'</strong>',
	                    '<br>Value: <strong>', data.value, '</strong>',
	                    '</div>'].join('')
	            
			}
		}

		var map = new Datamap(mapArgs)
		this.map = map;
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
		this.clear()
		this.drawMap();
	}

	render(){
		return(
			<div id='mapContainer' style={styles.map} ref='container'></div>
		)
	}
}

const styles={
	map : {
		width : '100%',
		height : '100%',
	},
}