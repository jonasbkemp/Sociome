import dispatcher from '../Dispatcher';
import * as $ from 'jquery'
import DataStore from '../stores/DataStore'

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
	var url;
	switch(DataStore.getState().currentDataset){
		case 'Policy':
			url = `/PolicyData?policy=${category.table}&field=${category.value}`
			break;
		case 'Health Outcomes':
			url = `/HealthOutcomes?measure_name=${category.value}`
			break;
		case 'Demographics':
			url = `/Demographics?col=${category.value}`
			break;
	}
	dispatcher.dispatch({
		type : 'FETCH_DATA_START'
	})
	$.get(url).done(data => {
		dispatcher.dispatch({
			type : 'FETCH_DATA_DONE',
			data : data
		})
	}).fail(err => {
		dispatcher.dispatch({
			type : 'SET_ERROR',
			msg : err.responseText
		})
	})
}

export function changeYear(year){
	dispatcher.dispatch({
		type : 'CHANGE_YEAR',
		year : year
	})
}

/**
 * Submit a POST request to the server.  Should respond with a .csv file with 
 * the appropriate data fields in it
 * 
 * @param  {Array<Object>} fields - Array of fields to be included in the CSV
 * @return null        
 */
export function downloadData(fields){
	dispatcher.dispatch({
		type : 'DOWNLOAD_DATA_START'
	})
	$.post(`/CSV`, {fields : fields})
		.done((result, textStatus, request) => {
			var a = document.createElement('a')
			a.setAttribute('download', 'data.csv')
			a.setAttribute('target', '_blank')
			a.download = 'data.csv'
			var blob = new Blob([result], {type : 'text/csv'})
			a.href = window.URL.createObjectURL(blob)
			dispatcher.dispatch({
				type : 'DOWNLOAD_DATA_DONE'
			})
			a.click()
		})
		.fail(err => {
			dispatcher.dispatch({
				type : 'SET_ERROR',
				msg : err.responseText
			})
		})
}



