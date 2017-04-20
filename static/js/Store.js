import {createStore, combineReducers, applyMiddleware} from 'redux'
import error from './reducers/ErrorReducer'
import pages from './reducers/PagesReducer'
import data from './reducers/DataReducer'
import {createLogger} from 'redux-logger'
import API from './middleware/API'

const reducer = combineReducers({
  error,
  pages,
  data
})

var store;
if(process.env.NODE_ENV === 'production'){
  store = createStore(reducer, {}, applyMiddleware(API))
}else{
  store = createStore(reducer, {}, applyMiddleware(createLogger(), API))
}

export default store;