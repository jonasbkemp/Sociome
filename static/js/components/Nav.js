import React from "react";
import {Link} from 'react-router';
import * as BS from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default class Nav extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      explore : 'map'
    }
  }

  render() {
    return (
      <BS.Navbar>
        <BS.Navbar.Brand>
          Mapping the American Sociome
        </BS.Navbar.Brand>
        <BS.Nav class="pull-right">
          <BS.NavDropdown id="dropdown" eventKey={1} title="Explore">
            <LinkContainer eventKey={1.1} to="/explore">
              <BS.MenuItem
                  id="map" 
                  key="map" 
                  active={this.state.explore === 'map'}>
                  Map
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.2} to="/compare-data">
              <BS.MenuItem
                  id="compare-data" 
                  key="compare-data" 
                  active={this.state.explore === 'compare-data'}>
                  Compare
              </BS.MenuItem>
            </LinkContainer>
            <LinkContainer eventKey={1.3} to="/sandbox">
              <BS.MenuItem
                  id="sandbox" 
                  key="sandox" 
                  active={this.state.explore === 'sandbox'}>
                  Sandbox
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
