import React from "react";
import {Link} from 'react-router';
import * as BS from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default class Nav extends React.Component {

  render() {
    return (
      <BS.Navbar>
        <BS.Navbar.Brand>
          Mapping the American Sociome
        </BS.Navbar.Brand>
        <BS.Nav class="pull-right">
          <LinkContainer to="/explore">
            <BS.NavItem eventKey={2}>
              Explore
            </BS.NavItem>
          </LinkContainer>
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
            <BS.NavItem eventKey={3}>
              Privacy
            </BS.NavItem>
          </LinkContainer>
        </BS.Nav>
      </BS.Navbar>
    );
  }
}
