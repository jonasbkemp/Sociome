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

const initialState = {
  datasets : [
    {value : 'policy', label : 'Policy'}, 
    {value : 'demographics', label : 'Demographics'}, 
    {value : 'health_outcomes', label : 'Health Outcomes'}
  ],
  policies : policyCategories,
  healthOutcomes : healthOutcomesCategories,
  demographics : demographicCategories,
  currentDataset : null,
  categories : [],                            // First level of categories
  subCateogires : [],                         // Second level of categories
  subSubCategories : [],                      // Third level of categories
  fields : [],                                // Last level of categories
  yearIndex : 0,                              //index into the `years array`
  years : [],                                 // years for which `data` is available
  yearlyData : []
}
  
const setDataset = (state, dataset) => {
  const nulls = {
    currentCategory : null,
    subCategories : [],
    currentSubCategory : null,
    fields : []
  }
  switch(dataset.value){
    case 'policy':
      return {
        ...state, 
        currentDataset : dataset,
        categories : state.policies,
        ...nulls
      }
    case 'health_outcomes':
      return {
        ...state, 
        currentDataset : dataset,
        categories : state.healthOutcomes,
        ...nulls
      }
    case 'demographics':
      return {
        ...state, 
        currentDataset : dataset,
        categories : state.demographics,
        ...nulls
      }
  }
}

const setSubCategory = (state, {category, subCategory}) => {
  if(state.currentDataset.value === 'policy'){
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

const setCategory = (state, category) => {
  switch(state.currentDataset.value){
    case 'policy':
      return {
        ...state,
        currentCategory : category,
        subCategories : Object.keys(state.policies[category]).map(c => ({value : c, label : c}))
      }
    case 'health_outcomes':
      return {
        ...state, 
        currentCategory : category,
        subCategories : state.healthOutcomes[category],
        fields : state.healthOutcomes[category]
      }
    case 'demographics':
      return {
        ...state,
        currentCategory : category,
        subCategories : state.demographics[category],
        fields : state.demographics[category]
      }
  }
}

// Get a unique sorted array of years for which we have data available. 
// This should be called after data is received from an AJAX call.
// This relies on every datapoint having a `year` field and is 
// sorted by that year field
// http://stackoverflow.com/questions/26958118/finding-unique-numbers-from-sorted-array-in-less-than-on
const getUniqueYears = data => {
  return _getUniqueYears(data, 0, data.length-1, false, [])
}

const _getUniqueYears = (data, left, right, skipFirst, years) => {
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

const setNewData = (state, data) => {
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
const getFirstYear = (data, year) => {
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

const getYearlyData = (data, year) => {
  var i = getFirstYear(data, year);
  var yearlyData = [];

  while(i < data.length && data[i].year === year){
    yearlyData.push(data[i]);
    i++;
  }
  return yearlyData;
}

const updateYear = (state, yearIndex) => {
  return {
    ...state, 
    yearIndex : yearIndex,
    yearlyData : getYearlyData(state.data, state.years[yearIndex])
  }
}

export default (state=initialState, action) => {
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





















