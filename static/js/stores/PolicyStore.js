import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';
import {fields} from './PolicyFields';

class PolicyStore extends EventEmitter{
	constructor(){
		super();
		this.fields = fields
		this.currentField = undefined
		this.policies = [
			{value : 'a_fiscal_11', label : 'fiscal'},
			{value : 'b_guns_11', label : 'guns'},
			{value : 'c_drugs_11', label : 'drugs'},
			{value : 'd_mala_11', label : 'malaria'},
			{value : 'e_educ_11', label : 'education'},
			{value : 'f_land_11', label : 'land'},
			{value : 'g_labor_11', label : 'labor'},
			{value : 'h_health_11', label : 'health'}, 
			{value : 'i_smoking_11', label : 'smoking'},
			{value : 'j_util_11', label : 'utility'},
			{value : 'o_courts_11', label : 'courts'},
			{value : 'q_death_11', label : 'death'},
			{value : 's_marr_11', label : 'marriage'},
			{value : 'r_enfor_11', label : 'enforced'},
			{value : 't_elect_11', label : 'electricity'},
			{value : 'v_race_11', label : 'race'}
		]
		this.currentPolicy = undefined
	}

	getPolicyFields(){
		console.log(this.fields)
		console.log('current policy = ' + this.currentPolicy)
		return this.currentPolicy ? this.fields[this.currentPolicy] : []
	}

	getCurrentPolicyField(){
		return this.currentField
	}

	getPolicies(){
		return this.policies; 
	}

	getCurrentPolicy(){
		return this.currentPolicy
	}

	setPolicy(newPolicy){
		this.currentPolicy = newPolicy;
		this.emit('change')
	}

	setPolicyField(field){
		this.currentField = field;
		this.emit('change')
	}
 
	handleActions(action){
		switch(action.type){
			case 'CHANGE_POLICY':
				this.setPolicy(action.policy);
				break;
			case 'CHANGE_POLICY_FIELD':
				this.setPolicyField(action.field)
				break;
		}
	}
}

const policyStore = new PolicyStore();
dispatcher.register(policyStore.handleActions.bind(policyStore))
export default policyStore

