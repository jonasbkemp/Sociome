import {EventEmitter} from 'events';
import dispatcher from 'sociome/Dispatcher';
import * as _ from 'lodash';
import {policyCategories} from 'sociome/data/PolicyCategories';
import {demographicCategories} from 'sociome/data/DemographicCategories';
import {healthOutcomesCategories} from 'sociome/data/HealthOutcomesCategories';

class DataStore extends EventEmitter{
	constructor(){
		super();
		this.datasets = ['Policy', 'Demographics', 'Health Outcomes'];
		this.policies = policyCategories;
		this.healthOutcomes = healthOutcomesCategories;
		this.demographics = demographicCategories;
		this.categories = [];   // First level of categories
		this.subCategories = []; // Second level of categories
		this.subSubCategories = [];  // Third level of categories
		this.fields = [];		// Last level of categories
		this.yearIndex = 0;    //index into the `years array`
		this.years = [];    // years for which `data` is available
	}

	getAll = () => {
		return {
			datasets : this.datasets,
			categories : this.getCategories(),
			subCateogires : this.getSubCategories(),
			subSubCategories : this.getSubSubCategories(),

		}
	}

	// Get a unique sorted array of years for which we have data available. 
	// This should be called after data is received from an AJAX call.
	// This relies on every datapoint having a `year` field and is 
	// sorted by that year field
	// http://stackoverflow.com/questions/26958118/finding-unique-numbers-from-sorted-array-in-less-than-on
	setYears = () => {
		this.years = [];
		this.getUniqueYears(0, this.data.length-1, false);
		this.yearIndex = 0;
	}

	getUniqueYears = (left, right, skipFirst) => {
		// contiguous chunk of same values (a...a)
		if(this.data[left].year === this.data[right].year){
			if(!skipFirst)
				this.years.push(this.data[left].year);
		}else{
			var mid = Math.floor((left+right)/2);
			this.getUniqueYears(left, mid, skipFirst);
			this.getUniqueYears(mid+1, right, this.data[mid].year === this.data[mid+1].year);
		}
	}

	getYears = () => {
		return this.years;
	}

	getYearIndex = () => {
		return this.yearIndex;
	}

	updateYear = (year) => {
		this.yearIndex = year;
		this.emit('change-year');
	}

	// Dataset Operations
	getDatasets = () => {
		return this.datasets;
	}

	setDataset = (dataset) => {
		this.currentDataset = dataset;
		switch(dataset){
			case 'Policy':
				this.categories = this.policies;
				break;
			case 'Health Outcomes':
				this.categories = this.healthOutcomes;
				break;
			case 'Demographics':
				this.categories = this.demographics;
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
		if(false && this.currentDataset === 'Health Outcomes'){
			return this.categories;
		}else{
			return Object.keys(this.categories).map((d) => ({value : d, label : d}));
		}
		return this.categories;
	}

	setCategory = (category) => {
		this.currentCategory = category;
		if(this.currentDataset === 'Health Outcomes' || this.currentDataset === 'Demographics'){
			this.fields = this.categories[category];
			this.emit('change-fields');
		}
	}

	getCurrentCategory = () => {
		return this.currentCategory;
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
 
 	setSubCategory = (category, subCategory) => {
 		this.currentSubCategory = subCategory;
 		if(this.currentDataset === 'Policy'){
 			this.currentCategory = category;
 			this.currentSubCategory = subCategory;
 			this.fields = this.policies[category][subCategory];
	 		this.emit('change-fields');
 		}
 	}

 	getCurrentSubCategory = () => {
 		return this.currentSubCategory;
 	}

 	// Field operations
 	// A field is the lowest level
 	getFields = () => {
 		return this.fields;
 	}

 	requestData = (url) => {
 		$.get(url).done((res) => {
 			this.data = res;
 			this.setYears();
 			this.emit('change-data');
 		}).fail((err) => {
 			console.log(err);
 		})
 	}

 	// Data is sorted by `year`.  Run a binary search
	// to find the first entry with that year
	getFirstYear = (year) => {
		var i = 0,
			j = this.data.length - 1 ;

		while(i <= j){
			var mid = Math.round((i+j) / 2);
			if(this.data[mid].year == year && (mid === 0 || this.data[mid-1].year !== year)){
				return mid;
			}
			if(this.data[mid].year >= year){
				j = mid-1;
			}else{
				i = mid+1;
			}
		}
		throw "Error: Couldn\'t find year";
	}

 	getData = () => {
 		var year = this.years[this.yearIndex];
 		var i = this.getFirstYear(year);
		var yearlyData = [];

		while(i < this.data.length && this.data[i].year === year){
			yearlyData.push(this.data[i]);
			i++;
		}
 		return yearlyData;
 	}

 	getLastCategory = () => {
 		return this.lastCategory;
 	}

 	setLastCategory = (category) => {
		this.lastCategory = category.value;
		switch(this.currentDataset){
			case 'Policy':
				this.requestData(`/PolicyData?policy=${category.table}&field=${category.value}`)
				break;
			case 'Health Outcomes':
				this.requestData(`/HealthOutcomes?measure_name=${category.value}`)
				break;
			case 'Demographics':
				this.requestData(`/Demographics?col=${category.value}`);
				break;
		}
 	}

	handleActions = (action) => {
		switch(action.type){
			case 'SET_DATASET':
				this.setDataset(action.dataset);
				break;
			case 'SET_SUB_CATEGORY':
				this.setSubCategory(action.category, action.subCategory);
				break;
			case 'SET_CATEGORY':
				this.setCategory(action.category);
				break;
			case 'SET_LAST_CATEGORY':
				this.setLastCategory(action.category);
				break;
			case 'CHANGE_YEAR':
				this.updateYear(action.year);
				break;
		}
	}
}

const dataStore = new DataStore();
export default dataStore;
dispatcher.register(dataStore.handleActions);