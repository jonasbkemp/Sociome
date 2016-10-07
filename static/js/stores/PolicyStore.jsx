import {EventEmitter} from 'events';
import dispatcher from 'sociome/Dispatcher';
import {fields} from 'sociome/stores/PolicyFields';
import * as _ from 'lodash';

const BACKEND_URL = process.env.NODE_ENV === 'production' ? 
					'http://sociome-ml9951.rhcloud.com' : 
					'http://localhost:8082';

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
		this.currentField = undefined;
		this.yearIndex = 0;
		this.emit('change-policy')
	}

	setPolicyField(field){
		this.currentField = field;
		var url = `${BACKEND_URL}/GetPolicyData?policy=${this.currentPolicy.code}&field=${field.code}`
		console.log(url)
		$.get(url).then((data) => {
			this.data = data
			this.years = _.uniq(data.map((d) => d.year), true)
			this.yearIndex = 0;
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

export const policyStore = new PolicyStore();
export const leftStore = new PolicyStore();
export const rightStore = new PolicyStore();

dispatcher.register(policyStore.handleActions.bind(policyStore))
/*
dispatcher.register(policyStore.handleActions.bind(leftStore))
dispatcher.register(policyStore.handleActions.bind(rightStore))
*/

