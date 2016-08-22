import React, {Component} from 'react';
import Select from 'react-select';
import ZoomMap from './ZoomMap';
var _ = require('underscore')
var d3 = require('d3')
var topojson = require('topojson')

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com/' : 
					'http://localhost:8082/'

export default class CompareMap extends Component{
	updatePolicy = () => {
		this.setState(_.extend({}, this.state, {
			feature : this.props.policyStore.getCurrentPolicy()
		}))
	}

	componentWillMount() {
	    this.props.policyStore.on('change-policy', this.updatePolicy)
	}

	componentWillUnmount () {
	    this.props.policyStore.removeListener('change-policy', this.updatePolicy)
	}

	constructor(props){
		super(props)

		this.active = d3.select(null)
		this.width = 650;
		this.height = 400;
		var projection = d3.geoAlbersUsa().scale(750).translate([this.width/2, this.height/2])

		this.state = {
			projection : projection,
			datasets : [{value : 'policy', label : 'Policy'}, {value : 'health-outcomes', label : 'Health Outcomes'}],
			dataset : undefined,
		}
	}

	changeDataset = (event) => {
		this.setState(_.extend({}, this.state, {
			dataset : event ? event.value : undefined,
		}))
	}



	changePolicyField = (event) => {
		console.log(BACKEND_URL + 'GetPolicyData?policy=' + this.state.feature.value + '&field=' + event.value)
		$.get(BACKEND_URL + 'GetPolicyData?policy=' + this.state.feature.value + '&field=' + event.value).then((data) => {
			this.setState(_.extend({}, this.state, {
				data : data,
				field : event,
			}))
		})
	}

	changeFeature = (event) => {
		if(this.state.dataset === 'policy'){
			this.props.policyStore.setPolicy(event)
		}else if(this.state.dataset === 'health-outcomes'){
			this.props.policyStore.setMeasure(event)
			if(event === null){
				this.setState(_.extend({}, this.state, {
					feature : undefined,
					data : undefined,
				}))
			}else{
				console.log(BACKEND_URL + 'GetHealthOutcomes?measure_name=' + event.value)
				$.get(BACKEND_URL + 'GetHealthOutcomes?measure_name=' + event.value).then((data) => {
					this.setState(_.extend({}, this.state, {
						feature : event,
						data : data
					}))	
				})
			}	
		}
	}

	getFeatures = () => {
		if(this.state.dataset === 'policy')
			return this.props.policyStore.getPolicies()
		else if(this.state.dataset === 'health-outcomes'){
			return this.props.policyStore.getMeasures()
		}
	}

	getYear = () =>{
		if(this.state.dataset === 'policy' && this.state.data){
			return this.state.data[0].year
		}else if(this.state.dataset === 'health-outcomes' && this.state.data){
			return this.state.data[0].start_year;
		}
		return undefined;
	}

	render(){
		console.log(this.state.field)
		return(
			<div style={{width : '100%', height : '100%'}}>
				<ZoomMap {...this.props} dataset={this.state.dataset} 
						 feature={this.state.feature} policyField={this.state.field}
						 data={this.state.data} year={this.getYear()}/>
				<div style={styles.dropdowns}>
					<h3 class="text-center">Choose Data Set</h3>
					<Select 
						value={this.state.dataset}
						onChange={this.changeDataset}
						options={this.state.datasets}/>
					<h3 class="text-center">Choose Feature</h3>
					<Select
						options={this.getFeatures()}
						value={this.state.feature ? this.state.feature.value : undefined}
						onChange={this.changeFeature}/>
					{
						this.state.dataset === 'policy' ? 
						<div>
							<h3 class='text-center'>Choose Field</h3>
							<Select
								value={this.state.field ? this.state.field.value : undefined}
								options={this.state.feature ? 
										 this.props.policyStore.getPolicyFields(this.state.feature.value) :
										 undefined}
								onChange={this.changePolicyField}/>
						</div>
						: null
					}
				</div>
				<div style={{height : 200}}></div>
			</div>
		)
	}
}

const styles = {
	dropdowns : {
		width : '50%',
		margin : '0 auto',
	}
}