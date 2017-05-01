/**
 * Redux store
 * @flow
 */

import {createStore, combineReducers, applyMiddleware} from 'redux'
import error from './reducers/ErrorReducer'
import pages from './reducers/PagesReducer'
import data from './reducers/DataReducer'
import geo from './reducers/GeoReducer'
import diffInDiff from './reducers/DiffInDiffReducer'
import {createLogger} from 'redux-logger'
import API from './middleware/API'

import type {ErrorState} from './reducers/ErrorReducer'
import type {PagesState} from './reducers/PagesReducer'
import type {DataState} from './reducers/DataReducer'
import type {GeoState} from './reducers/GeoReducer'
import type {DiffInDiffState} from './reducers/DiffInDiffReducer'
import type {Store, Reducer} from 'redux'
import type {Action} from './actions/Types'

const reducer : Reducer<State, Action> = combineReducers({
  error,
  pages,
  data,
  geo,
  diffInDiff
})

if(process.env.NODE_ENV === 'production'){
  var store : Store<State, Action> = createStore(reducer, {}, applyMiddleware(API))
}else{
  var store : Store<State, Action> = createStore(reducer, {}, applyMiddleware(API, createLogger()))
}

export default store;

export type State = {
  error : ErrorState,
  pages : PagesState,
  data : DataState,
  geo : GeoState,
  diffInDiff : DiffInDiffState
}
