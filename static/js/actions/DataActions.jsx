import dispatcher from 'sociome/Dispatcher';

export function setDataset(dataset){
	dispatcher.dispatch({
		type: 'SET_DATASET',
		dataset : dataset
	})
}

export function setSubCategory(subCategory){
	dispatcher.dispatch({
		type : 'SET_SUB_CATEGORY',
		subCategory : subCategory
	})
}