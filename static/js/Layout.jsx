import React, {Component} from 'react';
import Nav from './components/Nav';
import ExploreBar from './components/ExploreBar';

export default class Layout extends React.Component {
  render() {
    return (
      <div style={{height : '100%', width : '100%'}}>
        <Nav style={{height : '88px'}}/>
        <div style={{position : 'absolute', top : '88px', bottom : 0, width : '100%'}}>
          <ExploreBar style={{height : '60px'}}/>
        	{this.props.children}
        </div>
      </div>
    );
  }
}

