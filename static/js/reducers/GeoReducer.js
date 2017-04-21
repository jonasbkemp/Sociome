import {FETCH_STATES} from '../actions/Types'

const initialState = {
  states : null
}

export default (state=initialState, action) => {
  switch(action.type){
    case `${FETCH_STATES}_SUCCESS`:
      return {states : action.payload}
    default:
      return state;
  }
}