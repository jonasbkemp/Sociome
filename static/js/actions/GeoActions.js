/**
 * Geo Actions
 * @flow
 */
import {FETCH_STATES} from './Types'
import type {Action} from './Types'

export const fetchStates : Action = {
  type : FETCH_STATES,
  payload : {
    method : 'GET',
    url : '/geometries/states.min.json',
    json : true
  },
  meta : 'API'
}
