import Store from '../Store'
import {SET_DATASET, SET_CATEGORY, SET_SUB_CATEGORY, FETCH_DATA, CHANGE_YEAR, DOWNLOAD_DATA} from './Types'

export const setDataset = dataset => ({
	type : SET_DATASET,
	payload : dataset
})

export const setCategory = category => ({
	type : SET_CATEGORY,
	payload : category
})

export const setSubCategory = subCategory => ({
	type : SET_SUB_CATEGORY,
	payload : subCategory
}) 

export const setLastCategory = category => {
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

export const changeYear = year => ({
	type : CHANGE_YEAR,
	payload : year
})

export const downloadData = fields => ({
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