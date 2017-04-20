import React, {Component} from 'react';
import ZoomMap from '../components/ZoomMap';
import FieldMenu from '../components/FieldMenu';
import {connect} from 'react-redux'

class Explore extends Component{
	render(){
		return(
			<div style={{width : "100%", height : '100%', overflow: "hidden"}}>
				<div style={{width : '100%', display : 'table', height : '100%'}}>
				    <div style={{display : 'table-row'}}>
				    	<div style={{display : 'table-cell', width : '25%', height : '100%', position : 'absolute'}}>
				    		<FieldMenu/>
				    	</div>
				    	<div style={{display : 'table-cell', width : '75%'}}>
				    		<div style={{width : '100%'}}>
					    		<ZoomMap 
					    			style={{width : '100%'}}
					    			data={this.props.data} 
					    			dataset={this.props.data && this.props.data.length > 100 ? 'health-outcomes' : 'policy'}
					    		/>
				    		</div>
				    	</div>
				    </div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	data : state.data.yearlyData
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Explore)