/**
 * Analysis actions
 * @flow
 */

import {LINEAR_REGRESSION, DIFF_IN_DIFF, FETCH_DIFF_IN_DIFF_VARS} from './Types'
import type {Action, LinearRegression_t, DiffInDiff_t} from './Types'

export const linearRegression = (args : LinearRegression_t) : Action => ({
  type : LINEAR_REGRESSION,
  payload : {
    method : 'POST',
    url : '/LinRegression',
    json : true,
    body : args
  },
  meta : 'API'
})

export const diffInDiff = (args : DiffInDiff_t) : Action => ({
  type : DIFF_IN_DIFF,
  payload : {
    method : 'POST',
    url : '/DiffInDiff',
    json : true,
    body : args
  },
  meta : 'API'
})

export const fetchDiffInDiffVars : Action = {
  type : FETCH_DIFF_IN_DIFF_VARS,
  payload : {
    method : 'GET',
    url : '/DiffInDiff',
    json : true
  },
  meta : 'API'
}