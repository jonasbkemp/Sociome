import React, {Component} from 'react';
import Nav from './components/Nav';
import ExploreBar from './components/ExploreBar';
import {Container} from 'flux/utils'
import ErrorStore from './stores/ErrorStore'
import * as ErrorActions from './actions/ErrorActions'
import {Alert} from 'react-bootstrap'

class Layout extends React.Component {
  static getStores(){
    return [ErrorStore]
  }
  static calculateState(){
    return ErrorStore.getState()
  }

  handleAlertDismiss(){
    ErrorActions.clearError()
  }

  render() {
    return (
      <div style={{height : '100%', width : '100%'}}>
        <Nav style={{height : '88px'}}/>
        <div style={{position : 'absolute', top : '88px', bottom : 0, width : '100%'}}>
          <ExploreBar style={{height : '60px'}}/>
          {this.state.msg ?
            <Alert bsStyle='danger' onDismiss={this.handleAlertDismiss} style={{marginBottom: 0}}>
              <strong><p class='text-center'> {this.state.msg} </p></strong>
            </Alert> : null
          }
        	{this.props.children}
        </div>
      </div>
    );
  }
}

export default Container.create(Layout)