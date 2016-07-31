import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';

class PolicyStore extends EventEmitter{
	constructor(){
		super();
		this.policies = [
			'fiscal',
			'guns',
			'drugs',
			'malaria',
			'education',
			'land',
			'labor',
			'health',
			'smoking',
			'utility',
			'courts',
			'death',
			'marriage',
			'enforced',
			'electricity',
			'race'
		]
		this.currentPolicy = undefined
	}

	getPolicies(){
		return this.policies;
	}

	getCurrentPolicy(){
		return this.currentPolicy
	}

	setPolicy(newPolicy){
		this.currentPolicy = newPolicy;
	}

	handleActions(action){
		switch(action.type){
			case 'SET_POLICY':
				this.setPolicy(action.policy);
				break;
		}
	}
}

const policyStore = new PolicyStore();
dispatcher.register(policyStore.handleActions.bind(policyStore))
export default policyStore

