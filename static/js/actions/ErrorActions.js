import dispatcher from '../Dispatcher'

export function clearError(){
  dispatcher.dispatch({
    type : 'CLEAR_ERROR'
  })
}