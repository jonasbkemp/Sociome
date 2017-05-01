/**
 * Error reducer
 * @flow
 */

import {SET_ERROR, CLEAR_ERROR} from '../actions/Types'
import type {Action} from '../actions/Types'

const initialState : ErrorState = {
  msg : null
}

export default (state : ErrorState = initialState, action : Action) => {
  if(action.meta && action.meta.error){
    return {...state, msg : action.payload}
  }
  switch(action.type){
    case SET_ERROR:
      return {...state, msg : action.payload};
    case CLEAR_ERROR:
      return {...state, msg : null};
    default:
      return state;
  }
}

export type ErrorState = {
  msg : ?string
}