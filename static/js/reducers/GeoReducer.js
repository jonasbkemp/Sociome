/**
 * @flow
 */

import {FETCH_STATES} from '../actions/Types'
import type {Action} from '../actions/Types'

const initialState : GeoState = {
  states : null
}

export default (state : GeoState = initialState, action : Action) => {
  switch(action.type){
    case `${FETCH_STATES}_SUCCESS`:
      return {states : action.payload}
    default:
      return state;
  }
}

export type GeoState = {
  states : ?Object
}