import React, {Component} from 'react';
import ExploreBar from '../components/ExploreBar';
import ZoomMap from '../components/ZoomMap';
import * as _ from 'lodash';
import RegressionFieldMenu from '../components/RegressionFieldMenu';
import DataStore from '../stores/DataStore';
import {Container} from 'flux/utils'
import HTML5Backend from 'react-dnd-html5-backend';
import {DropTarget, DragDropContext} from 'react-dnd';
import DraggableLabel from '../components/DraggableLabel'
import Dropbox from '../components/Dropbox'
import update from 'immutability-helper'
import {Button} from 'react-bootstrap'
import * as DataActions from '../actions/DataActions'

class Download extends Component{
  static getStores(){
    return [DataStore]
  }

  static calculateState(){
    return {...this.state, ...DataStore.getState()}
  }

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
    console.log(item)
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
    DataActions.downloadData(this.state.items)
  }

  render(){
    var fields = this.state.fields.filter(field => this.state.dropped[field.value] == null)
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


export default Container.create(Download)