import {LINEAR_REGRESSION, DIFF_IN_DIFF, FETCH_DIFF_IN_DIFF_VARS} from './Types'

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

export const fetchDiffInDiffVars = {
  type : FETCH_DIFF_IN_DIFF_VARS,
  payload : {
    method : 'GET',
    url : '/DiffInDiff',
    json : true
  },
  meta : 'API'
}