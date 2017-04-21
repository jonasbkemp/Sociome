import {SET_ERROR, CLEAR_ERROR} from '../actions/Types'

const initialState = {
  msg : null
}

export default (state=initialState, action) => {
  if(action.meta && action.meta.error){
    return {...state, msg : action.payload}
  }
  switch(action.type){
    case SET_ERROR:
      return {...state, msg : action.payload};
    case CLEAR_ERROR:
      return {...state, msg : null};
    default:
      return state;
  }
}

