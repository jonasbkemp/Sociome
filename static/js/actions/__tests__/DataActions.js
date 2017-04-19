var jsdom = require('jsdom').jsdom;

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

describe('DataStore', () => {
  var DataStore;
  var DataActions;
  var server;
  var ErrorStore;

  beforeEach(() => {
    jest.resetModules()
    DataStore = require('../../stores/DataStore').default
    DataActions = require('../DataActions')
    ErrorStore = require('../../stores/ErrorStore').default
    server = sinon.fakeServer.create()
    server.respondImmediately = true
  })

  afterEach(() => {
    server.restore()
  })

  it('Goes through Policy hierarchy', () => {
    server.respondWith(
      'GET',
      /\/Data.*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )

    var stub = sinon.stub(DataStore, 'setNewData').callsFake(state => state)
    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset({label : 'Policy', value : 'policy'})
    expect(DataStore.getState().currentDataset.label).toBe('Policy')
    DataActions.setCategory('Land & Environment')
    expect(DataStore.getState().currentCategory).toBe("Land & Environment")
    DataActions.setSubCategory('Land & Environment', 'Regulations')
    expect(DataStore.getState().currentSubCategory).toBe('Regulations')
    DataActions.setLastCategory({"table":"a_fiscal_11","value":"anrspt"})
    sinon.assert.calledOnce(stub)
  })

  it('Goes through Health Outcomes hierarchy', () => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )
    var stub = sinon.stub(DataStore, 'setNewData').callsFake(state => state)

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset({value : 'health_outcomes', label : 'Health Outcomes'})
    expect(DataStore.getState().currentDataset.label).toBe('Health Outcomes')
    DataActions.setCategory('Health Behaviors')
    expect(DataStore.getState().currentCategory).toBe("Health Behaviors")
    DataActions.setLastCategory({value : 'Adult Obesity'})
    sinon.assert.calledOnce(stub)
  })

  it('Goes through Demographics hierarchy', () => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )
    var stub = sinon.stub(DataStore, 'setNewData').callsFake(state => state)

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset({label : 'Demographics', value : 'demographics'})
    expect(DataStore.getState().currentDataset.label).toBe('Demographics')
    DataActions.setCategory('Race')
    expect(DataStore.getState().currentCategory).toBe("Race")
    DataActions.setLastCategory({value : 'population_white'})
    sinon.assert.calledOnce(stub)
  })

  it('Changes years', () => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(
        [{year : 2000}, {year : 2001}]
      )]
    )

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset({label : 'Demographics', value : 'demographics'})
    expect(DataStore.getState().currentDataset.label).toBe('Demographics')
    DataActions.setCategory('Race')
    expect(DataStore.getState().currentCategory).toBe("Race")
    DataActions.setLastCategory({value : 'population_white'})
    DataActions.changeYear(1)
    expect(DataStore.getState().yearlyData[0].year).toBe(2001)
  })

  it('(setLastCategory) responds to errors', () => {
    server.respondWith(
      'GET',
      /\/Data*/,
      [400, {'Content-Type' : 'application/json'}, '400 error']
    )

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset({label : 'Demographics', value : 'demographics'})
    expect(DataStore.getState().currentDataset.label).toBe('Demographics')
    DataActions.setCategory('Race')
    expect(DataStore.getState().currentCategory).toBe("Race")
    DataActions.setLastCategory({value : 'population_white'})
    expect(ErrorStore.getState().msg).toBe('400 error')
  })

  it('Downloads Data', () => {
    server.respondWith(
      'POST',
      /\/CSV*/,
      [200, {'Content-Type' : 'text/csv'}, 'c1,c2\n0,1']
    )
    var Dispatcher = require('../../Dispatcher').default
    var spy = sinon.spy(Dispatcher, 'dispatch')
    var old = global.window.URL
    global.window.URL = {createObjectURL : jest.fn(() => 'fake-url')}
    DataActions.downloadData([{table:"a_fiscal_11", value:"anrspt",dataset : 'Policy'}])
    global.window.URL = old;
    expect(spy.getCall(0).args[0].type).toBe('DOWNLOAD_DATA_START')
    expect(spy.getCall(1).args[0].type).toBe('DOWNLOAD_DATA_DONE')
  })

  it('Reports errors', () => {
    server.respondWith(
      'POST',
      /\/CSV*/,
      [401, {'Content-Type' : 'text/csv'}, 'c1,c2\n0,1']
    )
    var Dispatcher = require('../../Dispatcher').default
    var spy = sinon.spy(Dispatcher, 'dispatch')
    var old = global.window.URL
    global.window.URL = {createObjectURL : jest.fn(() => 'fake-url')}
    DataActions.downloadData([{table:"a_fiscal_11", value:"anrspt",dataset : 'Policy'}])
    global.window.URL = old;
    expect(spy.getCall(0).args[0].type).toBe('DOWNLOAD_DATA_START')
    expect(spy.getCall(1).args[0].type).toBe('SET_ERROR')
  })


})