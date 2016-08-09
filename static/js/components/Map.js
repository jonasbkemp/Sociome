var d3 = require('d3')
import Datamap from 'datamaps/dist/datamaps.usa.min'
import React, {Component} from 'react';
import policyStore from '../stores/PolicyStore';
var _ = require('underscore')
import {states} from '../data/StateCodes'

const BACKEND_URL='http://localhost:8080/'

export default class Map extends Component{

	_updatePolicy(){
		var policy = policyStore.getCurrentPolicy()
		var field = policyStore.getCurrentPolicyField()
		console.log(BACKEND_URL + 'GetPolicyData?policy=' + policy.code + '&field=' + field.code)
		$.get(BACKEND_URL + 'GetPolicyData?policy=' + policy.code + '&field=' + field.code).then((data) => {
			this.setState(_.extend({}, this.state, {
				currentPolicy : policy,
				currentPolicyField : field,
				data : data
			}))
		})
	}

	constructor(props){
		super(props)
		this.updatePolicy = this._updatePolicy.bind(this)
		this.state = {
			currentPolicy : policyStore.getCurrentPolicy(),
			currentPolicyField : policyStore.getCurrentPolicyField(),
			data : []
		}
	}

	drawMap(){
		var mapArgs = {
			element : this.refs.container,
			responsive : true,
			scope : 'usa'
		}
		if(this.state.currentPolicyField){
			var rawVals = this.state.data.map((point) => point[this.state.currentPolicyField.code])

	    	var minValue = d3.min(rawVals),
	            maxValue = d3.max(rawVals);

	        console.log('min = ' + minValue + ', max = ' + maxValue)

	        var palette = d3.scaleLinear()
					             .domain([minValue,maxValue])
					             .range(["#EFEFFF","#02386F"]); // blue color

			var data = {}
			for(var i = 0; i < this.state.data.length; i++){
				var val = this.state.data[i][this.state.currentPolicyField.code]
				data[states[this.state.data[i].state]] = {
					fillColor : palette(val),
					value : val
				}
			}
			mapArgs.data = data;
			mapArgs.geographyConfig = {
				highlightFillColor: function(geo) {
	                return geo['fillColor'] || '#F5F5F5';
	            },
				popupTemplate: (geo, data) =>
	                ['<div class="hoverinfo">',
	                    '<strong>', this.state.currentPolicyField.label ,'</strong>',
	                    '<br>Value: <strong>', data.value, '</strong>',
	                    '</div>'].join('')
	            
			}
		}



		console.log('Drawing map')
		console.log(data)
		var map = new Datamap(mapArgs)
		this.map = map;
	}

	clear = () => {
		const container = this.refs.container;
		for (const child of Array.from(container.childNodes)) {
			container.removeChild(child);
		}
	}

	componentWillMount() {
	    policyStore.on('change-field', this.updatePolicy)
	}

	componentWillUnmount () {
	    policyStore.removeListener('change-field', this.updatePolicy)
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