var jsdom = require('jsdom').jsdom;

process.env.NODE_ENV='production' // suppress redux-logger

global.document = jsdom('');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

import React from 'react'
import sinon from 'sinon'
import {parse} from 'url-parse'

const fakeData = [
  {value : 0, year : 1957},
  {value : 2, year : 1957},
  {value : 2, year : 1958}
]

describe('DataActions', () => {
  var server;
  var store;
  var DataActions;

  beforeEach(() => {
    jest.resetModules()
    store = require('../../Store').default
    DataActions = require('../../actions/DataActions')
    server = sinon.fakeServer.create()
    server.respondImmediately = true
  })

  afterEach(() => {
    server.restore()
  })

  it('Goes through Policy hierarchy', done => {
    server.respondWith(
      'GET',
      /\/Data.*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(fakeData)]
    )

    store.dispatch(DataActions.setDataset({label : 'Policy', value : 'policy'}))
    expect(store.getState().data.currentDataset.value).toBe('policy')

    store.dispatch(DataActions.setCategory('Land & Environment'))
    expect(store.getState().data.currentCategory).toBe('Land & Environment')

    store.dispatch(DataActions.setSubCategory('Land & Environment', 'Regulations'))
    expect(store.getState().data.currentSubCategory).toBe('Regulations')

    store.dispatch(DataActions.setLastCategory({"table":"a_fiscal_11","value":"anrspt"}))
      .then(() => {
        expect(store.getState().data.yearlyData.length).toBe(2)
        done()
      })
  })

  it('Goes through Health Outcomes hierarchy', done => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(fakeData)]
    )

    expect(store.getState().data.currentDataset).toBeNull()

    store.dispatch(DataActions.setDataset({value : 'health_outcomes', label : 'Health Outcomes'}))
    expect(store.getState().data.currentDataset.value).toBe('health_outcomes')

    store.dispatch(DataActions.setCategory('Health Behaviors'))
    expect(store.getState().data.currentCategory).toBe("Health Behaviors")

    store.dispatch(DataActions.setLastCategory({value : 'Adult Obesity'}))
      .then(() => {
        expect(store.getState().data.yearlyData.length).toBe(2)
        done()
      })
  })

  it('Goes through Demographics hierarchy', done => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(fakeData)]
    )

    expect(store.getState().data.currentDataset).toBeNull()

    store.dispatch(DataActions.setDataset({value : 'demographics', label : 'Demographics'}))
    expect(store.getState().data.currentDataset.value).toBe('demographics')

    store.dispatch(DataActions.setCategory('Race'))
    expect(store.getState().data.currentCategory).toBe("Race")

    store.dispatch(DataActions.setLastCategory({value : 'population_white'}))
      .then(() => {
        expect(store.getState().data.yearlyData.length).toBe(2)
        done()
      })
  })

  it('Changes years', done => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(fakeData)]
    )

    expect(store.getState().data.currentDataset).toBeNull()

    store.dispatch(DataActions.setDataset({value : 'demographics', label : 'Demographics'}))
    expect(store.getState().data.currentDataset.value).toBe('demographics')

    store.dispatch(DataActions.setCategory('Race'))
    expect(store.getState().data.currentCategory).toBe("Race")

    store.dispatch(DataActions.setLastCategory({value : 'population_white'}))
      .then(() => {
        expect(store.getState().data.yearlyData.length).toBe(2)

        store.dispatch(DataActions.changeYear(1))

        expect(store.getState().data.yearlyData.length).toBe(1)

        done()
      })
  })

  it('(setLastCategory) responds to errors', () => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [400, {'Content-Type' : 'application/json'}, '400 error']
    )

    expect(store.getState().data.currentDataset).toBeNull()

    store.dispatch(DataActions.setDataset({value : 'demographics', label : 'Demographics'}))
    expect(store.getState().data.currentDataset.value).toBe('demographics')

    store.dispatch(DataActions.setCategory('Race'))
    expect(store.getState().data.currentCategory).toBe("Race")

    store.dispatch(DataActions.setLastCategory({value : 'population_white'}))
      .catch(e => done)
  })

  it('Downloads Data', done => {
    server.respondWith(
      'POST',
      /\/CSV*/,
      [200, {'Content-Type' : 'text/csv'}, 'c1,c2\n0,1']
    )

    var old = global.window.URL
    global.window.URL = {createObjectURL : jest.fn(() => 'fake-url')}
    store.dispatch(DataActions.downloadData([{table:"a_fiscal_11", value:"anrspt",dataset : 'Policy'}]))
      .then(() => {  
        done() 
      })

  })

  // it('Reports errors', () => {
  //   server.respondWith(
  //     'POST',
  //     /\/CSV*/,
  //     [401, {'Content-Type' : 'text/csv'}, 'c1,c2\n0,1']
  //   )
  //   var Dispatcher = require('../../Dispatcher').default
  //   var spy = sinon.spy(Dispatcher, 'dispatch')
  //   var old = global.window.URL
  //   global.window.URL = {createObjectURL : jest.fn(() => 'fake-url')}
  //   DataActions.downloadData([{table:"a_fiscal_11", value:"anrspt",dataset : 'Policy'}])
  //   global.window.URL = old;
  //   expect(spy.getCall(0).args[0].type).toBe('DOWNLOAD_DATA_START')
  //   expect(spy.getCall(1).args[0].type).toBe('SET_ERROR')
  // })


})