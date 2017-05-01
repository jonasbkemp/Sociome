/**
 * Data Actions
 * @flow
 */

import Store from '../Store'
import {SET_DATASET, SET_CATEGORY, SET_SUB_CATEGORY, FETCH_DATA, CHANGE_YEAR, DOWNLOAD_DATA} from './Types'
import type {Action, Select_t} from './Types'

export const setDataset = (dataset : Select_t) : Action => ({
	type : SET_DATASET,
	payload : dataset
})

export const setCategory = (category : Select_t) : Action => ({
	type : SET_CATEGORY,
	payload : category
})

export const setSubCategory = (subCategory : Select_t) : Action => ({
	type : SET_SUB_CATEGORY,
	payload : subCategory
})

export const setLastCategory = (category : Select_t) : Action => {
	const [currentDataset, ...rest] = Store.getState().data.selected;
	return{
		type : FETCH_DATA,
		payload : {
			method : 'GET',
			url : `/Data/${currentDataset.value}/${category.value}`,
			json : true
		},
		meta : 'API'
	}
}

export const changeYear = (year : number) : Action => ({
	type : CHANGE_YEAR,
	payload : year
})

export const downloadData = (fields : Array<Select_t>) : Action => ({
	type : DOWNLOAD_DATA,
	payload : {
		method : 'POST',
		url : '/CSV',
		body : {
			fields : fields
		}
	},
	meta : 'API'
})
