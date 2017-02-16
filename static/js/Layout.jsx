import React, {Component} from 'react';
import Nav from './components/Nav';
import ExploreBar from './components/ExploreBar';
import {Container} from 'flux/utils'
import ErrorStore from './stores/ErrorStore'
import * as ErrorActions from './actions/ErrorActions'
import {Alert} from 'react-bootstrap'
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import PagesStore from './stores/PagesStore'

class Layout extends React.Component {
  static getStores(){
    return [ErrorStore, PagesStore]
  }
  static calculateState(){
    return{
      msg : ErrorStore.getState().msg,
      popup : PagesStore.getState().popup
    }
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
          {
            this.state.popup ? 
              <div style={{position : 'absolute', top : 0, bottom : 0, left : 0, right : 0}}>
                <div style={styles.background}>
                </div>
                <div style={{zIndex : 40, height : '100%', width : '100%', display : 'flex', alignItems : 'center', justifyContent : 'center'}}>
                  {this.state.popup.component}
                </div>
              </div> : null
          }
        	{this.props.children}
        </div>
      </div>
    );
  }
}

const styles = {
  background : {
    position : 'absolute',
    top : 0,
    bottom : 0,
    right : 0, left : 0,
    backgroundColor : 'rgb(93,97,100)',
    opacity : 0.7,
    zIndex : 10
  }
}

export default DragDropContext(HTML5Backend)(Container.create(Layout));