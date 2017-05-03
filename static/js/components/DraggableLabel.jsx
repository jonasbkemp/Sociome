/**
 * Draggable Label Component
 * @flow
 */
import React from 'react';
import {DragSource} from 'react-dnd';
import Select from 'react-select';
import Store from '../Store'

import type {DragSource as DragSource_t} from 'react-dnd'

const fieldSource = {
  beginDrag(props, monitor, component){
    const [currentDS, ...rest] = Store.getState().data.selected;

    return {
      ...props,
      dataset : currentDS && currentDS.value,
    };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource : connect.dragSource(),
  isDragging: monitor.isDragging()
})

type State = {
  year : ?number
}

type Props = {
  years : Array<number>
}

/** 
 * This is sort of an ugly hack, but `year` needs to be in props because
 * State is an abstract type in React$Component and cannot be accessed
 * in `fieldSource`
 */
export default class DraggableLabel_ extends React.Component<*,*,*>{
  state : State

  props : Props
  constructor(props : Props){
    super(props);
    this.state = {
      year : props.years ? props.years[0] : null
    }
  }
  render(){
    return(
      <Connected
        {...this.props}
        changeYear={option => this.setState({year : option.value})}
        years={this.props.years}
        year={this.state.year}
      />
    )
  }
}

class DraggableLabel extends React.Component{
  render(){
    return this.props.connectDragSource(
      <div style={styles.fieldContainer}>
        <div style={{flexGrow : 1}}>
          <p style={{margin : 5}}>{this.props.label}</p>
        </div>
        { 
          this.props.noYears ? null : 
          <div style={{flex : '0 0 70px', margin : '5px 5px 5px 0px'}}>
          {
            this.props.years ? 
            <Select
              clearable={false}
              placeholder="Year"
              style={{height : 20}}
              options={this.props.years.map(y => ({value : y, label : y}))}
              onChange={this.props.changeYear}
              value={this.props.year}
            /> : null
          }
          </div>
        }
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

const Connected = DragSource(props => props.type, fieldSource, collect)(DraggableLabel);