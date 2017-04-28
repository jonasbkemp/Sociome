import {FETCH_DIFF_IN_DIFF_VARS} from '../actions/Types'


const initialState = {
  policy : [],
  outcomes : []
}

export default (state=initialState, action) => {
  switch(action.type){
    case `${FETCH_DIFF_IN_DIFF_VARS}_SUCCESS`:
      return {...state, ...action.payload}
    default:
      return state;
  }
}