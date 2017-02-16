import Dispatcher from '../Dispatcher'

export function linearRegression(args, cb){
  Dispatcher.dispatch({
    type : 'LINEAR_REGRESSION_START'
  })
  $.post(`/LinRegression`, args).done(result => {
    result = JSON.parse(result);
    Dispatcher.dispatch({
      type : 'LINEAR_REGRESSION_DONE'
    })
    cb && cb(result)
  }).fail(err => {
    Dispatcher.dispatch({
      type : 'SET_ERROR',
      msg : err.responseText
    })
  })
}