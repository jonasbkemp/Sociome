import React from 'react';
import {DragSource} from 'react-dnd';
import DataStore from '../stores/DataStore';
import * as _ from 'lodash';
import * as DataActions from '../actions/DataActions';
import Select from 'react-select';
import {Button} from 'react-bootstrap';
import {Container} from 'flux/utils'

const fieldSource = {
  beginDrag(props, monitor, component){
    return _.extend({}, props, {
      year : component.state.year,
      dataset : DataStore.getState().currentDataset,
    });
  }
};

const collect = (connect, monitor) => ({
  connectDragSource : connect.dragSource(),
  isDragging: monitor.isDragging()
})

class DraggableLabel extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      year : this.props.years && this.props.years.length > 0 ? 
          this.props.years[0] : undefined
    }
  }

  changeYear = (option) => {
    this.setState(_.extend({}, this.state, {year : option.value}))
  }

  render(){
    return this.props.connectDragSource(
      <div class="container-fluid">
        <div style={styles.fieldContainer} class="row">
          <div class={`col-xs-${this.props.noYears ? 12 : 7} text-center`}>
            <p style={{margin : 5}}>{this.props.label}</p>
          </div>
          { 
            this.props.noYears ? null : 
            <div class="col-xs-5">
            {
              this.props.years ? 
              <Select
                clearable={false}
                placeholder="Year"
                style={{height : 20}}
                options={this.props.years.map(y => ({value : y, label : y}))}
                onChange={this.changeYear}
                value={this.state.year}
              /> : null
            }
            </div>
          }
        </div>
      </div>
    )
  }
}

const styles = {
  fieldContainer : {
    display : 'flex',
    alignItems : 'center',
    borderRadius : 5,
    backgroundColor : 'rgb(121,192,183)',
    marginBottom : 5
  }
}

export default DragSource(props => props.type, fieldSource, collect)(DraggableLabel);