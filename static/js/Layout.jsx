import React, {Component} from 'react';
import Nav from './components/Nav';

export default class Layout extends React.Component {
  render() {
    return (
      <div>
        <Nav/>
        <div style={{position : 'absolute', top : 50, left : 0, bottom : 0, right : 0}}>
        	{this.props.children}
        </div>
      </div>
    );
  }
}

