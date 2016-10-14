import dispatcher from 'sociome/Dispatcher';

export function setDataset(dataset){
	dispatcher.dispatch({
		type: 'SET_DATASET',
		dataset : dataset
	})
}

export function setCategory(category){
	dispatcher.dispatch({
		type : 'SET_CATEGORY',
		category : category
	})
}

export function setSubCategory(category, subCategory){
	dispatcher.dispatch({
		type : 'SET_SUB_CATEGORY',
		subCategory : subCategory,
		category : category
	})
}

export function setLastCategory(category){
	dispatcher.dispatch({
		type : 'SET_LAST_CATEGORY',
		category : category
	})
}

export function changeYear(year){
	dispatcher.dispatch({
		type : 'CHANGE_YEAR',
		year : year
	})
}