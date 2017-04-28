import Store from './Store'
import * as GeoActions from './actions/GeoActions'
import * as AnalysisActions from './actions/AnalysisActions'

console.log('Dispatching')
Store.dispatch(GeoActions.fetchStates)

Store.dispatch(AnalysisActions.fetchDiffInDiffVars)
