import Store from './Store'
import * as GeoActions from './actions/GeoActions'

console.log('Dispatching')
Store.dispatch(GeoActions.fetchStates)
