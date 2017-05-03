/**
 * Common layout for all Pages
 * @flow
 */
import React, {Component} from 'react';
import Nav from './components/Nav';
import ExploreBar from './components/ExploreBar';
import * as ErrorActions from './actions/ErrorActions'
import {Alert} from 'react-bootstrap'
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import {connect} from 'react-redux'
import {cover} from './Styles'

import type {MapDispatchToProps, MapStateToProps} from 'react-redux'
import type {State} from './Store'
import type {Action} from './actions/Types'
import type {Dispatch} from 'redux'

const styles = {
  cover,
  shade : {
    backgroundColor : 'rgb(93,97,100)',
    opacity : 0.7,
    zIndex : 10,
    overflow : 'scroll'
  },
  loader : {
    display : 'flex',
    justifyContent : 'center',
    alignItems : 'center',
    zIndex : 40
  }
}

class Layout extends React.Component {
  handleAlertDismiss = () => {
    this.props.clearError()
  }

  render() {
    return (
      <div style={styles.cover}>
        {
          this.props.popup ?
            <div style={{...styles.cover, ...styles.shade, ...styles.loader}}>
              {this.props.popup}
            </div> : null
        }
        <div style={styles.cover}>
          <Nav style={{height : '88px'}} />
          {/*<ExploreBar data={this.props.data} style={{height : '60px', marginTop : '88px'}}/>*/}
          {this.props.msg ?
            <Alert bsStyle='danger' onDismiss={this.handleAlertDismiss} style={{marginBottom: 0}}>
              <strong><p class='text-center'> {this.props.msg} </p></strong>
            </Alert> : null
          }
          <div style={{...styles.cover, top : '88px'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps : MapStateToProps<State,*,*> = state => ({
  msg : state.error.msg,
  popup : state.pages.popup,
  data : state.data
})

const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch : Dispatch<Action>) => ({
  clearError : () => dispatch(ErrorActions.clearError)
})

const connected = connect(mapStateToProps, mapDispatchToProps)(Layout)

export default DragDropContext(HTML5Backend)(connected);
