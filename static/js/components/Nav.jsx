import React from "react";
import {Link} from 'react-router';
import * as BS from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
var _ = require('underscore')

export default class Nav extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      activeKey : 1.1,
    }
  }

  onSelect = (event) => {
    this.setState(_.extend({}, this.state, {activeKey : event}))
  }

  render() {
    return (
      <BS.Navbar>
        <BS.Navbar.Brand>
          Mapping the American Sociome
        </BS.Navbar.Brand>

        <BS.Nav class="pull-right" activeKey={this.state.activeKey} onSelect={this.onSelect}>
          <BS.NavDropdown id="dropdown" eventKey={1} title="Explore">
            <LinkContainer eventKey={1.1} to="/explore">
              <BS.MenuItem>
                Map
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.2} to="/compare-data">
              <BS.MenuItem>
                Compare
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.3} to="/sandbox">
              <BS.MenuItem>
                Sandbox
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.4} to="/diff-in-diff">
              <BS.MenuItem>
                Differences-In-Differences
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.5} to="/multi-level">
              <BS.MenuItem>
                Multi Level Modelling
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.6} to="/regression">
              <BS.MenuItem>
                Linear Regression
              </BS.MenuItem>
            </LinkContainer>
          </BS.NavDropdown>
          <LinkContainer to="/purpose">
            <BS.NavItem eventKey={2}>
              Purpose
            </BS.NavItem>
          </LinkContainer>
          <LinkContainer to="/contact">
            <BS.NavItem eventKey={3}>
              Contact
            </BS.NavItem>
          </LinkContainer>
          <LinkContainer to="/privacy">
            <BS.NavItem eventKey={4}>
              Privacy
            </BS.NavItem>
          </LinkContainer>
        </BS.Nav>
      </BS.Navbar>
    );
  }
}
