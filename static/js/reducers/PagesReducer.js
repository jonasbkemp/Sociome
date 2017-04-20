
import {SHOW_COMPONENT, SET_ERROR, CLEAR_COMPONENT} from '../actions/Types'

const initialState = {
  popup : null,
  loading : false
}

export default (state=initialState, action) => {
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
