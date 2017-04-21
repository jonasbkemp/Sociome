import {FETCH_STATES} from './Types'

export const fetchStates = {
  type : FETCH_STATES,
  payload : {
    method : 'GET',
    url : '/geometries/states.min.json',
    json : true
  },
  meta : 'API'
}



