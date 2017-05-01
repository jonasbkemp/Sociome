export const SET_ERROR = 'SET_ERROR';
export const CLEAR_ERROR = 'CLEAR_ERROR';
export const SET_DATASET = 'SET_DATASET';
export const SET_SUB_CATEGORY = 'SET_SUB_CATEGORY';
export const SET_CATEGORY = 'SET_CATEGORY';
export const FETCH_DATA = 'FETCH_DATA'
export const CHANGE_YEAR = 'CHANGE_YEAR';
export const DOWNLOAD_DATA = 'DOWNLOAD_DATA';
export const LINEAR_REGRESSION = 'LINEAR_REGRESSION';
export const DIFF_IN_DIFF = 'DIFF_IN_DIFF';
export const FETCH_STATES = 'FETCH_STATES';
export const SHOW_COMPONENT = 'SHOW_COMPONENT';
export const HIDE_COMPONENT = 'HIDE_COMPONENT';
export const FETCH_DIFF_IN_DIFF_VARS = 'FETCH_DIFF_IN_DIFF_VARS'

export type data_t = {
  year : number,
  statecode : number,
  countycode : number,
  value : number,
  county : string
}

// Type used with react-select
export type select_t = {
  value : string,
  label : string
}

export type api_t = {
  method : string,
  url : string,
  body : Object
}

import type {Element} from 'react'

export type Action = 
    {|type : SET_ERROR, payload : string|}
  | {|type : CLEAR_ERROR |}
  | {|type : SET_DATASET, payload : select_t|}
  | {|type : SET_SUB_CATEGORY, payload : select_t|}
  | {|type : SET_CATEGORY, payload : select_t|}
  | {|type : FETCH_DATA, payload : api_t|}
  | {|type : CHANGE_YEAR, payload : number|} //year index
  | {|type : DOWNLOAD_DATA, payload : api_t|}
  | {|type : LINEAR_REGRESSION, payload : api_t|}
  | {|type : DIFF_IN_DIFF, payload : api_t|}
  | {|type : FETCH_STATES, payload : api_t|}
  | {|type : SHOW_COMPONENT, payload : {component : Element<*>, style : Object, props : Object} |}
  | {|type : HIDE_COMPONENT|}
  | {|type : FETCH_DIFF_IN_DIFF_VARS, payload : api_t|}