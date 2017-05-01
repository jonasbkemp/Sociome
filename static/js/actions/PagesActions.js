/**
 * Pages Actions.  These actions will inject
 * components into different pages.  The primary
 * use case is to overlay a component on top of
 * the layout (Ex: a loading/progress bar)
 * @flow
 */

import {SHOW_COMPONENT, HIDE_COMPONENT} from './Types'
import type {Action} from './Types'
import type {Element} from 'react'

/**
 * Show `component` on top of whatever is rendered in `Layout`
 * @param  {React.Component} component : The component to be rendered
 */
const showComponent = (component : Element<*>, style : Object, props : Object) : Action => ({
  type : 'SHOW_COMPONENT',
  payload : {
    component : component,
    style : style,
    props : props
  }
})

/**
 * Hide the currently displayed component (if any)
 */
export const hideCurrentComponent : Action = {
  type : HIDE_COMPONENT
}
