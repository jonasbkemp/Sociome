import React, {Component} from 'react';
import {getStateInfo} from '../data/StateCodes';
import Dimensions from 'react-dimensions';
import * as _ from 'lodash';
var d3 = require('d3')
var topojson = require('topojson')

// Note: the format of the county id's is a 5 digit 
// number: ssccc, where "ss" corresponds to the two
// digits representing the state and "ccc" is the 
// three digit code corresponding to the county id.

export class ZoomMap extends Component{
	constructor(props){
		super(props)
		this.width = this.props.containerWidth; //650;
		this.height = this.props.containerWidth * 0.61538461538462;//400;
		var projection = d3.geoAlbersUsa().scale(950).translate([this.width/2, this.height/2])

		this.state = {
			projection : projection,
			datasets : [{value : 'policy', label : 'Policy'}, {value : 'health', label : 'Health Outcomes'}],
		}
	}

	// This is a hack from http://stackoverflow.com/questions/16799116/handling-mouse-events-in-overlapping-svg-layers
	// to allow mouse over events at the county level.  Without this, the state layer covers it up. 
	// This will take a mouse event at the state layer and pass it through to the county layer.
	passThru(d) {
    var e = d3.event;
    var prev = this.style.pointerEvents;
    this.style.pointerEvents = 'none';
    var el = document.elementFromPoint(d3.event.x, d3.event.y);
    var e2 = document.createEvent('MouseEvent');
    e2.initMouseEvent(e.type,e.bubbles,e.cancelable,e.view, e.detail,e.screenX,e.screenY,e.clientX,e.clientY,e.ctrlKey,e.altKey,e.shiftKey,e.metaKey,e.button,e.relatedTarget);
    el.dispatchEvent(e2);
    this.style.pointerEvents = prev;
  }

  addStateHover = (options) => {
  	this.states.on('mousemove', (d, i, children) => {
      var mouse = d3.mouse(document.body)
      this.tooltip.classed('hidden', false)
        .attr('style', 'left:' + (mouse[0] + 15) +
              'px; top:' + (mouse[1] - 35) + 'px')
        .html(getStateInfo(d.id).state);
      if(options.withColor){
        this.states.style('fill', (state) => d.id === state.id ? '#0C4999' : '#ccc')
     	}
    })
    .on('mouseout', () => {
    	this.tooltip.classed('hidden', true)
    	if(options.withColor){
    		this.states.style('fill', '#ccc')
    	}
  	})
  } 

    updateCounties = () => {
    	var {data, min, max} = _.reduce(this.props.data, (res, d) => {
    		if(!res.data[d.statecode])
    			res.data[d.statecode] = d;
    		else
    			res.data[d.statecode][d.countycode] = d;
    		res.min = Math.min(res.min, d.value);
    		res.max = Math.max(res.max, d.value);
    		return res;
    	}, {data : {}, min : Number.MAX_VALUE, max : Number.MIN_VALUE});

    	var heatmap = d3.scaleLinear()
			    	.domain([min, max])
				    .interpolate(d3.interpolateRgb)
				    .range(["#EFEFFF","#02386F"])

  		this.counties.style('fill', function(d){
  			var county = d.id % 1000
  			var state = Math.floor(d.id / 1000)
  			if(data[state] && data[state][county]){
  				return heatmap(data[state][county].value)
  			}
  		}).on('mousemove', (d, i, children) => {
        var mouse = d3.mouse(document.body);
        var county = d.id % 1000
  			var state = Math.floor(d.id / 1000)
  			if(data[state] && data[state][county]){
  				var value = data[state][county].value
          this.tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) +
                    'px; top:' + (mouse[1] - 35) + 'px')
            .html(`
              <b>${getStateInfo(state).state}</b><br/>
              <b>${data[state][county].county}</b><br/>
              Value: ${value}`)
  			}
      })
      .on('mouseout', () => {
      	this.tooltip.classed('hidden', true)
      })
    }

    updateStates = () => {
    	var {stateData, min, max} = _.reduce(this.props.data, (res, d) => {
    		res.stateData[d.statecode] = d;
    		res.min = Math.min(res.min, d.value);
    		res.max = Math.max(res.max, d.value);
    		return res;
    	}, {stateData : {}, min : Number.MAX_VALUE, max : Number.MIN_VALUE});

  		var heatmap = d3.scaleLinear()
  	    	.domain([min, max])
  		    .interpolate(d3.interpolateRgb)
  		    .range(["#EFEFFF","#02386F"])

  		this.states.style('fill', (d) => {
  			if(d.id > 56)
  				return
  			var currentState = stateData[d.id]
  			if(currentState){
  				return heatmap(currentState.value)
  			}
  		}).on('mousemove', (d) => {
        var mouse = d3.mouse(document.body);
        var currentState = stateData[d.id];
        var value = currentState ? currentState.value : 'Missing Data';
        this.tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) +
                    'px; top:' + (mouse[1] - 35) + 'px')
            .html(getStateInfo(d.id).state + '<br/>Value: ' + value);
      }).on('mouseout', () => {
      	this.tooltip.classed('hidden', true)
      })
    }

	drawMap = () => {
    if(this.props.statesGeom == null){
      return
    }
		var path = d3.geoPath().projection(this.state.projection)

		this.svg = d3.select(this.refs.container).append('svg')
			.attr('id', 'my-svg')
			.attr('width', this.width).attr('height', this.height)

		this.tooltip = d3.select(this.refs.container).append('div')
    	.attr('class', 'hidden tooltip');

		this.g = this.svg.append('g')
		const geom = this.props.statesGeom
		// draw county lines if we are plotting the Health Outcomes data
		if(this.props.dataset === 'health-outcomes' && this.props.data){

			this.counties = this.g.append('g').attr('id', 'county-lines').selectAll('path')
				.data(topojson.feature(geom, geom.objects.counties).features)
				.enter().append('path').attr('d', path)

      // Draw the state lines.  
      this.states = this.g.append('g').attr('id', 'state-lines').selectAll('path')
      	.data(topojson.feature(geom, geom.objects.states).features)
      	.enter().append('path')
      	.attr("d", path)		
      	.on('click', this._stateClicked())
          .style('stroke', '#fff')
          .style('fill-opacity', '0.0')
          .style('cursor', 'pointer')
         	.on('mouseout', () => this.tooltip.classed('hidden', true))

			this.updateCounties();
			this.states.on('mousemove', this.passThru);
		}else{
			// Draw the state lines.  
      this.states = this.g.append('g').selectAll('path')
        	.data(topojson.feature(geom, geom.objects.states).features)
        	.enter().append('path')
    	.attr("d", path)		
    	.on('click', this._stateClicked())
      .style('stroke', '#fff')
      .style('cursor', 'pointer')
      .style('fill', '#ccc')
      if(this.props.data.length > 0){
      	this.updateStates();
      }
		}
	}

	reset = (component) => {
		this.addStateHover({withColor : this.props.data == undefined})
  	this.g.transition()
     	.duration(750)
      	.style("stroke-width", "1.5px")
      	.attr("transform", "");
	}

	_stateClicked = () => {
		var component = this
		return function(d){
			if(component.active === this){
				component.active = undefined;
				return component.reset(component);
			}

			component.active = this;

			if(component.props.dataset === 'health-outcomes'){
	            component.states.on('mousemove', component.passThru)
			}

			var bbox = this.getBBox()
			var bounds = [[bbox.x, bbox.y], [bbox.x+bbox.width, bbox.y+bbox.height]],
			  dx = bounds[1][0] - bounds[0][0],
			  dy = bounds[1][1] - bounds[0][1],
			  x = (bounds[0][0] + bounds[1][0]) / 2,
			  y = (bounds[0][1] + bounds[1][1]) / 2,
			  scale = .9 / Math.max(dx / component.width, dy / component.height),
			  translate = [component.width / 2 - scale * x, component.height / 2 - scale * y];

			component.g.transition()
			  .duration(750)
			  .style("stroke-width", 1.5 / scale + "px")
			  .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

		}
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

	componentDidUpdate = () => {
		this.clear()
		this.drawMap()
	}

	// Only update the map if the data changed...
	shouldComponentUpdate(nextProps){
    if(this.props.statesGeom == null && nextProps.statesGeom != null){
      return true
    }else if(this.props.dataset === nextProps.dataset && this.props.data){
			this.props = nextProps;
			if(this.props.dataset === 'health-outcomes'){
				this.updateCounties()
			}else{
				this.updateStates()
			}
			return false;
		}
		return this.props.data !== nextProps.data;
	}

	render(){
		return(
			<div id="container-id" ref='container'></div>
		)
	}
}

export default Dimensions()(ZoomMap)




