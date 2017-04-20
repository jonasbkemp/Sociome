import 'whatwg-fetch'

export default store => next => action => {
  if(action.meta === 'API'){
    next({
      type : `${action.type}_PENDING`,
      payload : {
        loader : true
      }
    })
    const {method, body, url, json} = action.payload

    var options = {method}
    if(body){
      options.body = JSON.stringify(body)
      options.headers = {'Content-Type' : 'application/json'}
    }

    console.log(options)

    return fetch(url, options)
    .then(response => {
      if(json)
        return response.json()
      else
        return response.text()
    })
    .catch(err => {
      console.log(err)
      next({
        type : `${action.type}_ERROR`,
        payload : err
      })
    })
    .then(data => {
      next({
        type : `${action.type}_SUCCESS`,
        payload : data
      })
      return data
    })

  }else{
    next(action)
  }
}