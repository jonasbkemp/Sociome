import dispatcher from '../Dispatcher';
import {ReduceStore} from 'flux/utils'

class ErrorStore extends ReduceStore{
  constructor(){
    super(dispatcher)
  }

  getInitialState(){
    return {
      msg : null
    }
  }

  reduce(state, action){
    switch(action.type){
      case 'SET_ERROR':
        return {msg : action.msg}
      case 'CLEAR_ERROR':
        return {msg : null}
      default: 
        return state
    }
  }
}

export default new ErrorStore()