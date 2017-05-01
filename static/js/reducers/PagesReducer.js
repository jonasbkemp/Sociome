import React from 'react'
import Loader from 'halogen/PulseLoader'
import {SHOW_COMPONENT, SET_ERROR, HIDE_COMPONENT} from '../actions/Types'
import type {Element} from 'react'
import type {Action} from '../actions/Types'

const initialState : PagesState = {
  popup : null,
  loading : false
}

const loader = {
  component : <Loader color="#26A65B" size="16px" margin="4px" style={{zIndex : 5000}}/>,
  style : {}  
}

export default (state : PagesState = initialState, action : Action) => {
  if(action.meta && action.meta.issueLoader){
    return {...state, popup : loader, loading : true}
  }else if(action.meta && action.meta.hideLoader){
    return {...state, popup : null, loading : false}
  }
  switch(action.type){
    case SHOW_COMPONENT:
      return {
        ...state, 
        popup : action.payload
      };
    case HIDE_COMPONENT:
      return {...state, popup : null, loading : false};
    case SET_ERROR:
      if(state.loading){
        return {...state, popup : null, loading : false};
      }// else do nothing...
    default:
      return state;
  }
}

export type PagesState = {
  popup : ?{
    component : Element<*>,
    style : Object,  //TODO: remove this field
    props : Object   //TODO: remove this field
  },
  loading : boolean
}