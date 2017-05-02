/**
 * Download page
 * @flow
 */
import React from 'react';
import ExploreBar from '../components/ExploreBar';
import ZoomMap from '../components/ZoomMap';
import HTML5Backend from 'react-dnd-html5-backend';
import {DropTarget, DragDropContext} from 'react-dnd';
import DraggableLabel from '../components/DraggableLabel'
import Dropbox from '../components/Dropbox'
import update from 'immutability-helper'
import {Button} from 'react-bootstrap'
import * as DataActions from '../actions/DataActions'
import {connect} from 'react-redux'

import type {Select_t, Action} from '../actions/Types'
import type {MapStateToProps, MapDispatchToProps} from 'react-redux'
import type {Dispatch} from 'redux'
import type {State} from '../Store'

class Download extends React.Component<*,*,*>{
  constructor(){
    super();
    this.state = {
      dropped : {},
      items : []
    }
  }

  fieldToTable = field => {
    switch(field.dataset){
      case 'Policy':
        return field.table
      case 'Demographics':
        return 'demographics'
      case 'Health Outcomes':
        return 'health_outcomes_pivot'
    }
  }

  handleDrop = (item) => {
    this.setState(update(this.state, {
      items : {
        $push : [{
          label : `${item.dataset}: ${item.label}`,
          value : item.value,
          dataset : item.dataset,
          table : item.table,
          value : item.value
        }]
      },
      dropped : {
        [item.value] : {
          $set : true
        }
      }
    }))
  }

  fetchData = () => {
    this.props.downloadData(this.state.items)
      .then(result => {
        var a = document.createElement('a')
        a.setAttribute('download', 'data.csv')
        a.setAttribute('target', '_blank')
        a.download = 'data.csv'
        var blob = new Blob([result], {type : 'text/csv'})
        a.href = window.URL.createObjectURL(blob)
        a.click()
      })

  }

  render(){
    var fields = this.props.fields.filter(field => this.state.dropped[field.value] == null)
    return(
      <div class="row" style={{marginTop : 50}}>
        <div class="col-xs-3">
        {
          fields.map(field =>
            <div class="row" key={field.value}>
              <div class="col-xs-11 col-xs-offset-1">
                <DraggableLabel
                  type="field"
                  {...field}
                  noYears
                />
              </div>
            </div>
          )
        }
        </div>

        <div class="col-xs-9 center-block">
          <Dropbox
            style={{height : 300, width : '90%'}}
            onDrop={this.handleDrop}
            label='Drag Variables Here'
            accepts='field'
            items={this.state.items}
          />
          <Button style={{marginTop : 10}} bsStyle="primary" onClick={this.fetchData}>
            Fetch Data
          </Button>
        </div>
      </div>

    )
  }
}

const mapStateToProps : MapStateToProps<State,*,*> = state => state.data

const mapDispatchToProps : MapDispatchToProps<State,*,*> = (dispatch :  Dispatch<Action>) => ({
  downloadData : fields => dispatch(DataActions.downloadData(fields))
})


export default connect(mapStateToProps, mapDispatchToProps)(Download)
