import Dispatcher from '../Dispatcher'
import {LINEAR_REGRESSION, DIFF_IN_DIFF} from './Types'

export const linearRegression = args => ({
  type : LINEAR_REGRESSION,
  payload : {
    method : 'POST',
    url : '/LinRegression',
    json : true,
    body : args
  },
  meta : 'API'
})

export const diffInDiff = args => ({
  type : DIFF_IN_DIFF,
  payload : {
    method : 'POST',
    url : '/DiffInDiff',
    json : true,
    body : args
  },
  meta : 'API'
})