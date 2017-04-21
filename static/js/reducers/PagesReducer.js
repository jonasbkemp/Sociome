import React from 'react'
import Loader from 'halogen/PulseLoader'
import {SHOW_COMPONENT, SET_ERROR, CLEAR_COMPONENT} from '../actions/Types'

const initialState = {
  popup : null,
  loading : false
}

const loader = {
  component : <Loader color="#26A65B" size="16px" margin="4px"/>,
  style : {}  
}

export default (state=initialState, action) => {
  if(action.meta && action.meta.issueLoader){
    return {...state, popup : loader, loading : true}
  }else if(action.meta && action.meta.hideLoader){
    return {...state, popup : null, loading : false}
  }
  switch(action.type){
    case SHOW_COMPONENT:
      return {
        ...state, 
        popup : {
          component : action.component,
          style : action.style
        }
      };
    case CLEAR_COMPONENT:
      return {...state, popup : null, loading : false};
    case SET_ERROR:
      if(state.loading){
        return {...state, popup : null, loading : false};
      }// else do nothing...
    default:
      return state;
  }
}
