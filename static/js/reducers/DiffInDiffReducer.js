/**
 * Diff in diff reducer
 * @flow
 */
import {FETCH_DIFF_IN_DIFF_VARS} from '../actions/Types'
import type {Action} from '../actions/Types'

const initialState : DiffInDiffState = {
  policy : [],
  outcomes : []
}

export default (state : DiffInDiffState = initialState, action : Action) => {
  switch(action.type){
    case `${FETCH_DIFF_IN_DIFF_VARS}_SUCCESS`:
      return {...state, ...action.payload}
    default:
      return state;
  }
}

export type DiffInDiffState = {
  policy : Array<{value : string, label : string, dataset : string}>,
  outcomes : Array<{value : string, label : string, dataset : string}>
}