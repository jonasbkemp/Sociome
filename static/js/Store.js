import {createStore, combineReducers, applyMiddleware} from 'redux'
import error from './reducers/ErrorReducer'
import pages from './reducers/PagesReducer'
import data from './reducers/DataReducer'
import geo from './reducers/GeoReducer'
import diffInDiff from './reducers/DiffInDiffReducer'
import {createLogger} from 'redux-logger'
import API from './middleware/API'

const reducer = combineReducers({
  error,
  pages,
  data,
  geo,
  diffInDiff
})

var store;
if(process.env.NODE_ENV === 'production'){
  store = createStore(reducer, {}, applyMiddleware(API))
}else{
  store = createStore(reducer, {}, applyMiddleware(API, createLogger()))
}

export default store;