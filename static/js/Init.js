/**
 * required in client.jsx.  This performs any app initialization necessary
 * @flow
 */
import Store from './Store'
import * as GeoActions from './actions/GeoActions'
import * as AnalysisActions from './actions/AnalysisActions'

Store.dispatch(GeoActions.fetchStates)
Store.dispatch(AnalysisActions.fetchDiffInDiffVars)
