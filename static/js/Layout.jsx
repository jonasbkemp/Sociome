import React, {Component} from 'react';
import Nav from './components/Nav';
import ExploreBar from './components/ExploreBar';
import {Container} from 'flux/utils'
import * as ErrorActions from './actions/ErrorActions'
import {Alert} from 'react-bootstrap'
import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import {connect} from 'react-redux'

const styles = {
  cover : {
    position : 'absolute',
    top : 0,
    bottom : 0,
    right : 0, 
    left : 0,
  },
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
              {this.props.popup.component}
            </div> : null
        }
        <div style={styles.cover}>
          <Nav style={{height : '88px'}} />
          <ExploreBar data={this.props.data} style={{height : '60px', marginTop : '88px'}}/>
          {this.props.msg ?
            <Alert bsStyle='danger' onDismiss={this.handleAlertDismiss} style={{marginBottom: 0}}>
              <strong><p class='text-center'> {this.props.msg} </p></strong>
            </Alert> : null
          }
          <div style={{...styles.cover, top : '148px'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  msg : state.error.msg,
  popup : state.pages.popup,
  data : state.data
})

const mapDispatchToProps = dispatch => ({
  clearError : () => dispatch(ErrorActions.clearError)
})

const connected = connect(mapStateToProps, mapDispatchToProps)(Layout)

export default DragDropContext(HTML5Backend)(connected);







