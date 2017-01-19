import dispatcher from '../Dispatcher';

export function changePolicy(policy){
	dispatcher.dispatch({
		type: 'CHANGE_POLICY',
		policy: policy
	})
}

export function changePolicyField(field){
	dispatcher.dispatch({
		type: 'CHANGE_POLICY_FIELD',
		field : field
	})
}

export function changeYear(year){
	dispatcher.dispatch({
		type: 'CHANGE_YEAR',
		year : year
	})
}