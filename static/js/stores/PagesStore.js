/**
 * Pages Store
 */

import React from 'react'
import dispatcher from '../Dispatcher'
import {ReduceStore} from 'flux/utils'
import Loader from 'halogen/PulseLoader'

const loader = {
  popup : {
    component : <Loader color="#26A65B" size="16px" margin="4px"/>,
    style : {}
  }
}

class PagesStore extends ReduceStore{
  constructor(){
    super(dispatcher)
  }

  getInitialState() {
    return {
      popup : null
    }    
  }
  
  reduce(state, action){
    switch(action.type){
      case 'SHOW_COMPONENT':
        return {
          popup : {
            component : action.component,
            style : action.style
          }
        }
      case 'SET_ERROR':
      case 'FETCH_DATA_DONE':
      case 'DOWNLOAD_DATA_DONE':
        return {popup : null}
      case 'FETCH_DATA_START':
      case 'DOWNLOAD_DATA_START':
        return loader
      default:
        return state
    }
  }
}

export default new PagesStore()