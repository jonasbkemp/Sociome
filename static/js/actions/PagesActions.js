/**
 * Pages Actions.  These actions will inject
 * components into different pages.  The primary
 * use case is to overlay a component on top of 
 * the layout (Ex: a loading/progress bar)
 * @flow
 */
import Dispatcher from '../Dispatcher'

import type React from 'react'

/**
 * Show `component` on top of whatever is rendered in `Layout`
 * @param  {React.Component} component : The component to be rendered
 */
export function showComponent (component : React.Element<*>, style : Object, props : Object) : void {
  Dispatcher.dispatch({
    type : 'SHOW_COMPONENT',
    component : component,
    style : style,
    props : props
  })
}

/**
 * Hide the currently displayed component (if any)
 */
export function hideCurrentComponent() : void {
  Dispatcher.dispatch({
    type : 'HIDE_COMPONENT'
  })
}