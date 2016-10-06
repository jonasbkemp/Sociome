import React from "react";
import {Link} from 'react-router';
import * as BS from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
var _ = require('underscore')

export default class Nav extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        return(
            <div style={_.extend(this.props.style, {position : 'absolute', left : 0, right : 0})}>
                <span style={{display : 'table', height : '100%'}}>

                    <div style={{paddingLeft : 30, display : 'table-cell', verticalAlign : 'middle'}}>
                        <img style={{maxHeight : '35%'}} src="assets/logo_u7.png"/>
                    </div>

                    <div style={{paddingLeft : 15, display : 'table-cell', height : '100%', verticalAlign : 'middle'}}>
                        <p style={{
                            fontFamily : 'Avenir-Medium, Avenir Medium, Avenir Book, Avenir',
                            fontSize : '18px',
                            fontStyle : 'normal',
                            fontWeight : 500,
                        }}>
                            Mapping the American Sociome
                        </p>
                    </div>
                </span>  

                <span style={{display: 'table', position : 'absolute', right : '10', top : 0, height : '100%'}}>
                    <div style={{display : 'table-cell', verticalAlign : 'middle'}}>
                        <p style={{
                            fontFamily: 'Avenir-Heavy, Avenir Heavy, Avenir Book, Avenir',
                            fontWeight: 800,
                            fontStyle: 'normal',
                            fontSize: '10px',
                        }}>
                            About
                        </p>
                    </div>
                    <div style={{paddingLeft : 10, display : 'table-cell', verticalAlign : 'middle'}}>
                        <p style={{
                            fontFamily: 'Avenir-Heavy, Avenir Heavy, Avenir Book, Avenir',
                            fontWeight: 800,
                            fontStyle: 'normal',
                            fontSize: '10px',
                        }}>
                            Contact
                        </p>
                    </div>
                </span>
            </div>
        )
    }
}

