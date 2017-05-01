/**
 * Data Reducer
 * @flow
 */

import {
  SET_DATASET,
  SET_SUB_CATEGORY,
  SET_CATEGORY,
  FETCH_DATA,
  CHANGE_YEAR
} from '../actions/Types'
import {policyCategories} from '../data/PolicyCategories';
import {demographicCategories} from '../data/DemographicCategories';
import {healthOutcomesCategories} from '../data/HealthOutcomesCategories';

import type {data_t, Action, select_t} from '../actions/Types'

const initialState = {
  datasets : {
    policy : {
      label : 'Policy',
      categories : policyCategories
    },
    demographics : {
      label : 'Demographics',
      categories : demographicCategories
    },
    health_outcomes : {
      label : 'Health Outcomes',
      categories : healthOutcomesCategories
    }
  },
  data : [],
  fields : [],
  selected : [],
  yearIndex : 0,                              //index into the `years array`
  years : [],                                 // years for which `data` is available
  yearlyData : []
}

const setDataset = (state : DataState, dataset : select_t) : DataState => {
  const selected = [{...dataset, children : state.datasets[dataset.value].categories}];
  return {...state, selected, fields : []}
}

const setCategory = (state : DataState, category : select_t) : DataState => {
  var selected = state.selected.slice(0, 1);
  if(selected.length === 0){
    throw new Error('Selected category without selecting a dataset!');
  }

  selected.push({...category, children : selected[0].children[category.value]});

  //Lowest level
  if(Array.isArray(selected[1].children)){
    return {...state, selected, fields : selected[1].children}
  }else{
    return {...state, selected, fields : []}
  }
}

const setSubCategory = (state : DataState, subCategory : select_t) : DataState => {
  var selected = state.selected.slice(0, 2);
  if(selected.length !== 2){
    throw new Error('Selected Sub Category without selecting Category!');
  }
  selected.push({...subCategory, children : selected[1].children[subCategory.value]})
  return{...state, selected, fields : selected[2].children};
}

// Get a unique sorted array of years for which we have data available. 
// This should be called after data is received from an AJAX call.
// This relies on every datapoint having a `year` field and is 
// sorted by that year field
// http://stackoverflow.com/questions/26958118/finding-unique-numbers-from-sorted-array-in-less-than-on
const getUniqueYears = (data : Array<data_t>) : Array<number> => {
  return _getUniqueYears(data, 0, data.length-1, false, [])
}

const _getUniqueYears = (data : Array<data_t>, left : number, right : number, skipFirst : boolean, years : Array<number>) : Array<number> => {
  if(left > right)// `data` is empty
    return years
  // contiguous chunk of same values (a...a)
  if(data[left].year === data[right].year){
    if(!skipFirst)
      years.push(data[left].year);
  }else{
    var mid = Math.floor((left+right)/2);
    _getUniqueYears(data, left, mid, skipFirst, years);
    _getUniqueYears(data, mid+1, right, data[mid].year === data[mid+1].year, years);
  }
  return years
}

const setNewData = (state : DataState, data : Array<data_t>) : DataState => {
  var years = getUniqueYears(data)
  return {
    ...state, 
    data : data,
    years : years,
    yearIndex : 0,
    yearlyData : getYearlyData(data, years[0])
  }
}

// Data is sorted by `year`.  Run a binary search
// to find the first entry with that year
const getFirstYear = (data : Array<data_t>, year : number) : number => {
  var i = 0;
  var j = data.length - 1;

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

const getYearlyData = (data : Array<data_t>, year : number) : Array<data_t> => {
  var i : number = getFirstYear(data, year);
  var yearlyData = [];

  while(i < data.length && data[i].year === year){
    yearlyData.push(data[i]);
    i++;
  }
  return yearlyData;
}

const updateYear = (state : DataState, yearIndex : number) : DataState => {
  return {
    ...state, 
    yearIndex : yearIndex,
    yearlyData : getYearlyData(state.data, state.years[yearIndex])
  }
}

export default (state : DataState = initialState, action : Action) => {
  switch(action.type){
    case SET_DATASET:
      return setDataset(state, action.payload);
    case SET_SUB_CATEGORY:
      return setSubCategory(state, action.payload)
    case SET_CATEGORY:
      return setCategory(state, action.payload)
    case `${FETCH_DATA}_SUCCESS`:
      return setNewData(state, action.payload)
    case CHANGE_YEAR:
      return updateYear(state, action.payload)
    default:
      return state;
  }
}



export type DataState = {
  datasets : Object,
  fields : Array<Object>,
  selected : Array<Object>,
  yearIndex : number,
  years : Array<number>,
  yearlyData : Array<data_t>,
  data : Array<data_t>
}

















