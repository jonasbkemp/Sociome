import React from 'react'
import sinon from 'sinon'
import {parse} from 'url-parse'

describe('DataStore', () => {
  var DataStore;
  var DataActions;
  var server;

  beforeEach(() => {
    jest.resetModules()
    DataStore = require('../../stores/DataStore').default
    DataActions = require('../DataActions')
    server = sinon.fakeServer.create()
    server.respondImmediately = true
  })

  afterEach(() => {
    server.restore()
  })

  it('Goes through Policy hierarchy', () => {
    server.respondWith(
      'GET',
      /\/PolicyData.*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )

    var stub = sinon.stub(DataStore, 'setNewData', state => state)
    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset('Policy')
    expect(DataStore.getState().currentDataset).toBe('Policy')
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
      /\/HealthOutcomes*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )
    var stub = sinon.stub(DataStore, 'setNewData', state => state)

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset('Health Outcomes')
    expect(DataStore.getState().currentDataset).toBe('Health Outcomes')
    DataActions.setCategory('Health Behaviors')
    expect(DataStore.getState().currentCategory).toBe("Health Behaviors")
    DataActions.setLastCategory({value : 'Adult Obesity'})
    sinon.assert.calledOnce(stub)
  })

  it('Goes through Demographics hierarchy', () => {
    server.respondWith(
      'GET',
      /\/Demographics*/,
      [200, {'Content-Type' : 'application/json'}, '[]']
    )
    var stub = sinon.stub(DataStore, 'setNewData', state => state)

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset('Demographics')
    expect(DataStore.getState().currentDataset).toBe('Demographics')
    DataActions.setCategory('Race')
    expect(DataStore.getState().currentCategory).toBe("Race")
    DataActions.setLastCategory({value : 'population_white'})
    sinon.assert.calledOnce(stub)
  })

  it('Changes years', () => {
    server.respondWith(
      'GET',
      /\/Demographics*/,
      [200, {'Content-Type' : 'application/json'}, JSON.stringify(
        [{year : 2000}, {year : 2001}]
      )]
    )

    expect(DataStore.getState().currentDataset).toBeNull()
    DataActions.setDataset('Demographics')
    expect(DataStore.getState().currentDataset).toBe('Demographics')
    DataActions.setCategory('Race')
    expect(DataStore.getState().currentCategory).toBe("Race")
    DataActions.setLastCategory({value : 'population_white'})
    
    DataActions.changeYear(1)

    expect(DataStore.getState().yearlyData[0].year).toBe(2001)


  })




})