/**
 * Nav
 * @flow
 */

import React from "react";
import {Link} from 'react-router-dom';
import * as BS from 'react-bootstrap';

export default class Nav extends React.Component {
    props : {
        style : Object
    }
    render() {
        return(
            <div style={{...this.props.style, position : 'absolute', left : 0, right : 0}}>
                <span style={{display : 'table', height : '100%'}}>

                    <div style={{paddingLeft : 30, display : 'table-cell', verticalAlign : 'middle'}}>
                        <img style={{width : '30px', height : '42px'}} src="assets/logo_u7.png"/>
                    </div>

                    <div style={{paddingLeft : 15, display : 'table-cell', height : '100%', verticalAlign : 'middle'}}>
                        <p style={{...styles.font, fontWeight : 500, fontSize : 18}}>
                            Mapping the American Sociome
                        </p>
                    </div>
                </span>  

                <span style={{display: 'table', position : 'absolute', right : 10, top : 0, height : '100%'}}>
                    <div style={{display : 'table-cell', verticalAlign : 'middle', paddingRight : 10}}>
                        <p style={{...styles.font, fontSize : 16}}>
                            <Link to="/">
                                Explore
                            </Link>
                        </p>
                    </div>

                    <div style={{display : 'table-cell', verticalAlign : 'middle', paddingRight : 10}}>
                        <p style={{...styles.font, fontSize : 16}}>
                            <Link to="/regression">
                                Regression
                            </Link>
                        </p>
                    </div>

                    <div style={{display : 'table-cell', verticalAlign : 'middle', paddingRight : 10}}>
                        <p style={{...styles.font, fontSize : 16}}>
                            <Link to="/diff-in-diff">
                                Diff in Diff
                            </Link>
                        </p>
                    </div>

                    <div style={{display : 'table-cell', verticalAlign : 'middle', paddingRight : 10}}>
                        <p style={{...styles.font, fontSize : 16}}>
                            <Link to="/download">
                                Download
                            </Link>
                        </p>
                    </div>

                    <div style={{display : 'table-cell', verticalAlign : 'middle'}}>
                        <p style={{...styles.font, fontSize : 10}}>
                            about
                        </p>
                    </div>
                </span>
            </div>
        )
    }
}

const styles = {
    font : {
        fontFamily: 'Avenir-Heavy, Avenir Heavy, Avenir Book, Avenir',
        fontWeight: 800,
        fontStyle: 'normal',
        margin : '0 auto'
    }
}
