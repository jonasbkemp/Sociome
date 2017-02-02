import dispatcher from '../Dispatcher';
import * as _ from 'lodash';
import {policyCategories} from '../data/PolicyCategories';
import {demographicCategories} from '../data/DemographicCategories';
import {healthOutcomesCategories} from '../data/HealthOutcomesCategories';
import {ReduceStore} from 'flux/utils'

class DataStore extends ReduceStore{
	constructor(){
		super(dispatcher)
	}

	getInitialState(){
		return {
			datasets : ['Policy', 'Demographics', 'Health Outcomes'],
			policies : policyCategories,
			healthOutcomes : healthOutcomesCategories,
			demographics : demographicCategories,
			currentDataset : null,
			categories : [],														// First level of categories
			subCateogires : [],													// Second level of categories
			subSubCategories : [],											// Third level of categories
			fields : [],																// Last level of categories
			yearIndex : 0,															//index into the `years array`
			years : []																	// years for which `data` is available
		}
	}

	setDataset = (state, dataset) => {
		switch(dataset){
			case 'Policy':
				return {
					...state, 
					currentDataset : dataset,
					categories : state.policies
				}
			case 'Health Outcomes':
				return {
					...state, 
					currentDataset : dataset,
					categories : state.healthOutcomes
				}
			case 'Demographics':
				return {
					...state, 
					currentDataset : dataset,
					categories : state.demographics
				}
		}
	}

	setCategory = (state, category) => {
		switch(state.currentDataset){
			case 'Policy':
				return {
					...state,
					currentCategory : category,
					subCategories : Object.keys(state.policies[category]).map(c => ({value : c, label : c}))
				}
			case 'Health Outcomes':
				return {
					...state, 
					currentCategory : category,
					subCategories : state.healthOutcomes[category],
					fields : state.healthOutcomes[category]
				}
			case 'Demographics':
				return {
					...state,
					currentCategory : category,
					subCategories : state.demographics[category],
					fields : state.demographics[category]
				}
		}
	}
 
 	setSubCategory = (state, category, subCategory) => {
 		if(state.currentDataset === 'Policy'){
 			return {
 				...state, 
 				currentSubCategory : subCategory,
 				currentCategory : category,
 				fields : state.policies[category][subCategory]
 			}
 		}else{
 			return {
 				...state, 
 				currentSubCategory : subCategory
 			}
 		}
 	}

 	// Get a unique sorted array of years for which we have data available. 
	// This should be called after data is received from an AJAX call.
	// This relies on every datapoint having a `year` field and is 
	// sorted by that year field
	// http://stackoverflow.com/questions/26958118/finding-unique-numbers-from-sorted-array-in-less-than-on
	getUniqueYears = data => {
		return this._getUniqueYears(data, 0, data.length-1, false, [])
	}

	_getUniqueYears = (data, left, right, skipFirst, years) => {
		if(left > right)// `this.data` is empty
			return years
		// contiguous chunk of same values (a...a)
		if(data[left].year === data[right].year){
			if(!skipFirst)
				years.push(data[left].year);
		}else{
			var mid = Math.floor((left+right)/2);
			this._getUniqueYears(data, left, mid, skipFirst, years);
			this._getUniqueYears(data, mid+1, right, data[mid].year === data[mid+1].year, years);
		}
		return years
	}

 	setNewData = (state, data) => {
 		var years = this.getUniqueYears(data)
 		return {
 			...state, 
 			data : data,
 			years : years,
 			yearIndex : 0,
 			yearlyData : this.getYearlyData(data, years[0])
 		}
 	}

 	// Data is sorted by `year`.  Run a binary search
	// to find the first entry with that year
	getFirstYear = (data, year) => {
		var i = 0,
			j = data.length - 1 ;

		while(i <= j){
			var mid = Math.round((i+j) / 2);
			if(data[mid].year == year && (mid === 0 || data[mid-1].year !== year)){
				return mid;
			}
			if(data[mid].year >= year){
				j = mid-1;
			}else{
				i = mid+1;
			}
		}
		throw "Error: Couldn\'t find year";
	}

 	getYearlyData = (data, year) => {
 		var i = this.getFirstYear(data, year);
		var yearlyData = [];

		while(i < data.length && data[i].year === year){
			yearlyData.push(data[i]);
			i++;
		}
 		return yearlyData;
 	}

	updateYear = (state, yearIndex) => {
		return {
			...state, 
			yearIndex : yearIndex,
			yearlyData : this.getYearlyData(state.data, state.years[yearIndex])
		}
	}

	reduce = (state, action) => {
		switch(action.type){
			case 'SET_DATASET':
				return this.setDataset(state, action.dataset);
			case 'SET_SUB_CATEGORY':
				return this.setSubCategory(state, action.category, action.subCategory);
			case 'SET_CATEGORY':
				return this.setCategory(state, action.category);
			case 'NEW_DATA':
				return this.setNewData(state, action.data)
			case 'CHANGE_YEAR':
				return this.updateYear(state, action.year);
		}
	}
}

export default new DataStore()