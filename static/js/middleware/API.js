import axios from 'axios'

export default store => next => action => {
  if(action.meta === 'API'){
    next({
      type : `${action.type}_PENDING`,
      payload : {
        loader : true
      },
      meta : {
        issueLoader : true
      }
    })
    const {method, body, url, json} = action.payload

    return axios.request({
      url : url,
      method : method,
      data : body
    })
      .then(response => {
        next({
          type : `${action.type}_SUCCESS`,
          payload : response.data,
          meta : {hideLoader : true}
        })
        return response.data
      })
      .catch(err => {
        var response = err.response || {data : 'Something bad happened!'}
        next({
          type : `${action.type}_ERROR`,
          payload : response.data,
          meta : {error : true, hideLoader : true}
        })
      })
  }else{
    next(action)
  }
}