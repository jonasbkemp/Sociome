import React, {Component} from 'react';
import Select from 'react-select';
import ZoomMap from './ZoomMap';
var _ = require('underscore')

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

		this.state = {
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
		$.get(BACKEND_URL + 'GetYears?table=' + this.state.feature.value).then((data) => {
			this.setState(_.extend({}, this.state, {
				years : data.map((y) => {return {value:y, label:y}}), 
				field : event
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
				$.get(BACKEND_URL+'GetYears?table=' + event.value).then((data) => {
					this.setState(_.extend({}, this.state, {
						years : data.map((y) => {return{value:y,label:y}}),
						feature : event,
					}))
				})
			}	
		}
	}

	changeYear = (event) => {
		if(event === null){
			this.setState(_.extend({}, this.state, {year : undefined}));
		}else{
			if(this.state.dataset === 'health-outcomes'){
				console.log(BACKEND_URL + 'GetHealthOutcomes?measure_name=' + this.state.feature.value + 
					'&year=' + event.value)
				$.get(BACKEND_URL + 'GetHealthOutcomes?measure_name=' + this.state.feature.value + 
					'&year=' + event.value).then((data) => {
					this.setState(_.extend({}, this.state, {data : data,year:event}))	
				})
			}else if(this.state.dataset === 'policy'){
				$.get(BACKEND_URL + 'GetPolicyData?policy=' + this.state.feature.value + '&field=' + this.state.field.value).then((data) => {
					this.setState(_.extend({}, this.state, {data : data,year:event}))
				})
			}else{
				throw "Unrecognized dataset in changeYear";
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

	render(){
		return(
			<div style={{width : '100%', height : '100%'}}>
				<ZoomMap {...this.props} dataset={this.state.dataset} 
						 feature={this.state.feature} policyField={this.state.field}
						 data={this.state.data} year={this.state.year ? this.state.year.value : undefined}/>
				<div style={{width : '50%', margin : '0 auto'}}>
					<h3 class="text-center">Choose Data Set</h3>
					<Select 
						value={this.state.dataset}
						onChange={this.changeDataset}
						options={this.state.datasets}/>
					<h3 class="text-center">Choose Feature</h3>
					<Select
						options={this.getFeatures()}
						value={this.state.feature ? this.state.feature.value : undefined}
						onChange={this.changeFeature}
						disabled={this.state.dataset === undefined}
					/>
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
					<h3 class="text-center">Choose Year</h3>
					<Select
						options={this.state.years}
						value={this.state.year ? this.state.year.value : undefined}
						onChange={this.changeYear}
						disabled={this.state.dataset === undefined || 
								 (this.state.dataset === 'policy' && this.state.field === undefined) ||
								 (this.state.dataset === 'health-outcomes' && this.state.feature === undefined)}
					/>
				</div>
				<div style={{height : 200}}></div>
			</div>
		)
	}
}
