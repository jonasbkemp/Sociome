import {EventEmitter} from 'events';
var d3 = require('d3');

class TopoJsonStore extends EventEmitter{
	constructor(){
		super();
		this.promise = new Promise(function(resolve, reject){
			d3.json('js/topojson/states.min.js', (err, JSON) => {
				if(err){
					reject(err)
				}else{
					resolve(JSON)
				}
			})
		})
	}

	getJSON(callback){
		this.promise.then(callback)
	}
}

export const topoJsonStore = new TopoJsonStore();