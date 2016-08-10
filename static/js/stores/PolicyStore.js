import {EventEmitter} from 'events';
import dispatcher from '../Dispatcher';
import {fields} from './PolicyFields';
var _ = require('underscore')

const BACKEND_URL='http://localhost:8080/'

class PolicyStore extends EventEmitter{
	constructor(){
		super();
		this.fields = fields
		this.currentField = undefined
		this.policies = [
			{value : 'a_fiscal_11', label : 'Fiscal'},
			{value : 'b_guns_11', label : 'Guns'},
			{value : 'c_drugs_11', label : 'Drugs'},
			{value : 'd_mala_11', label : 'Malaria'},
			{value : 'e_educ_11', label : 'Education'},
			{value : 'f_land_11', label : 'Land'},
			{value : 'g_labor_11', label : 'Labor'},
			{value : 'h_health_11', label : 'Health'}, 
			{value : 'i_smoking_11', label : 'Smoking'},
			{value : 'j_util_11', label : 'Utility'},
			{value : 'o_courts_11', label : 'Courts'},
			{value : 'q_death_11', label : 'Death'},
			{value : 's_marr_11', label : 'Marriage'},
			{value : 'r_enfor_11', label : 'Enforced'},
			{value : 't_elect_11', label : 'Electricity'},
			{value : 'v_race_11', label : 'Race'}
		]
		this.currentPolicy = undefined
		this.data = []
		this.years = []
		this.yearIndex = undefined
	}

	getData(){
		return this.data
	}

	getYear(){
		return this.years[this.yearIndex];
	}

	getYearIndex(){
		return this.yearIndex;
	}

	getYears(){
		return this.years;
	}

	getPolicyFields(){
		return this.currentPolicy ? this.fields[this.currentPolicy.code] : []
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
		this.emit('change-policy')
	}

	setPolicyField(field){
		this.currentField = field;
		console.log('changing field')
		console.log(BACKEND_URL + 'GetPolicyData?policy=' + this.currentPolicy.code + '&field=' + field.code)
		$.get(BACKEND_URL + 'GetPolicyData?policy=' + this.currentPolicy.code + '&field=' + field.code).then((data) => {
			this.data = data
			this.years = _.uniq(data.map((d) => d.year), true)
			console.log(this.years)
			this.yearIndex = 0;
			console.log('emitting change')
			this.emit('change-field')
		})
	}

	setYear(year){
		this.yearIndex = year;
		this.emit('change-year')
	}
 
	handleActions(action){
		switch(action.type){
			case 'CHANGE_POLICY':
				this.setPolicy(action.policy);
				break;
			case 'CHANGE_POLICY_FIELD':
				this.setPolicyField(action.field)
				break;
			case 'CHANGE_YEAR':
				this.setYear(action.year)
				break;
		}
	}
}

const policyStore = new PolicyStore();
dispatcher.register(policyStore.handleActions.bind(policyStore))
export default policyStore

