import {EventEmitter} from 'events';
import dispatcher from 'sociome/Dispatcher';
import * as _ from 'lodash';
import {policyCategories} from 'sociome/data/PolicyCategories';
import {demographicCategories} from 'sociome/data/demographicCategories';

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com/' : 
					'http://localhost:8082/';

class DataStore extends EventEmitter{
	constructor(){
		super();
		this.datasets = ['Policy', 'Demographics', 'Health Outcomes'];
		this.policies = policyCategories;
		this.healthOutcomes = [
			{value:'children_in_poverty', label:'Children In Poverty'},
			{value:'adult_obesity', label:'Adult Obesity'},
			{value:'physical_inactivity', label:'Physical Inactivity'},
			{value:'air_pollution_particulate_matter', label:'Air Pollution Particulate Matter'},
			{value:'unemployment_rate', label:'Unemployment Rate'},
			{value:'sexually_transmitted_infections', label:'Sexually Transmitted Infections'},
			{value:'preventable_hospital_stays', label:'Preventable Hospital Stays'},
			{value:'violent_crime_rate', label:'Violent Crime Rate'},
			{value:'alcohol_impaired_driving_deaths', label:'Alcohol Impaired Driving Deaths'},
			{value:'uninsured', label:'Uninsured'},
			{value:'mammography_screening', label:'Mammography Screening'},
			{value:'premature_death', label:'Premature Death'},
			{value:'diabetic_monitoring', label:'Diabetic Monitoring'},
		]
		this.demographics = demographicCategories;
		this.categories = [];
		this.subCategories = [];
		this.subSubCategories = [];
	}

	// Dataset Operations
	getDatasets = () => {
		return this.datasets;
	}

	setDataset = (dataset) => {
		this.currentDataset = dataset;
		switch(dataset){
			case 'Policy':
				this.categories = Object.keys(this.policies).map((p) => ({value : p, label : p}));
				break;
			case 'Health Outcomes':
				this.categories = this.healthOutcomes;
				break;
			case 'Demographics':
				this.categories = Object.keys(this.demographics).map((d) => ({value : d, label : d}));
				break;
		}
		this.emit('change-dataset');
	}

	getCurrentDataset = () => {
		return this.currentDataset;
	}

	getPolicies = () => {
		return Object.keys(this.policies);
	}

	// Category Operations
	getCategories = () => {
		return this.categories;
	}

	// Subcategory Operations
	getSubCategories = (category) => {
		if(this.currentDataset === 'Policy'){
			return Object.keys(this.policies[category]).map((c) => ({value : c, label : c}));
		}else if(this.currentDataset === 'Demographics'){
			return this.demographics[category];
		}else{
			throw "Unrecognized category in getSubCategories"
		}
	}
 
 	setSubCategory = (subCategory) => {
 		this.currentSubCategory = subCategory;
 		this.emit('change-sub-category');
 		if(this.currentDataset === 'Demographics'){
 			this.emit('selection-done');
 		}
 	}

 	getCurrentSubCategory = () => {
 		return this.currentSubCategory;
 	}

	handleActions = (action) => {
		switch(action.type){
			case 'SET_DATASET':
				this.setDataset(action.dataset);
				break;
			case 'SET_SUB_CATEGORY':
				this.setSubCategory(action.subCategory);
				break;
		}
	}
}

const dataStore = new DataStore();
export default dataStore;
dispatcher.register(dataStore.handleActions);