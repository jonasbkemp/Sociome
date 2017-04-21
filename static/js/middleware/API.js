import 'whatwg-fetch'

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

    var options = {method}
    if(body){
      options.body = JSON.stringify(body)
      options.headers = {'Content-Type' : 'application/json'}
    }

    return fetch(url, options)
    .then(response => {
      if(json)
        return response.json()
      else
        return response.text()
    })
    .catch(err => {
      next({
        type : `${action.type}_ERROR`,
        payload : err,
        meta : {
          error : true
        }
      })
    })
    .then(data => {
      next({
        type : `${action.type}_SUCCESS`,
        payload : data,
        meta : {
          hideLoader : true
        }
      })
      return data
    })

  }else{
    next(action)
  }
}