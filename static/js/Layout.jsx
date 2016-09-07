import React, {Component} from 'react';
import Nav from 'sociome/components/Nav';

export default class Layout extends React.Component {
  render() {
    return (
      <div style={{height : '100%', width : '100%'}}>
        <Nav/>
        <div style={{height : '100%', width : '100%'}}>
        	{this.props.children}
        </div>
      </div>
    );
  }
}

