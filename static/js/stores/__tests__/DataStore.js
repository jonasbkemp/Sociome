import React from 'react'



describe('DataStore', () => {

  describe('setYears', () => {
    var DataStore;

    beforeEach(() => {
      jest.resetModules()
      DataStore = require('../DataStore').default
    })


    it('Works for empty arrays', () => {
      DataStore.data = []
      DataStore.setYears()
      expect(DataStore.getYears().length).toBe(0)
    })

    it('Works for singleton arrays', () => {
      var data = [{year : 2000}]
      DataStore.data = data
      DataStore.setYears()
      expect(DataStore.getYears()).toEqual(expect.arrayContaining(data.map(x => x.year)))
    })

    it('Works for arrays with unique values', () => {
      var data = [{year : 2000}, {year : 2001}, {year : 2005}, {year : 2007}, {year : 2012}]
      DataStore.data = data
      DataStore.setYears()
      expect(DataStore.getYears()).toEqual(expect.arrayContaining(data.map(x => x.year)))
    })
  })

  describe('getFirstYear', () => {
    var DataStore;

    beforeEach(() => {
      jest.resetModules()
      DataStore = require('../DataStore').default
    })

    it('It throws an error for empty arrays', () => {
      DataStore.data = []
      expect(() => DataStore.getFirstYear(1991)).toThrow()
    })

    it('Throws an error if it does not find it', () => {
      DataStore.data = [{year : 1991}, {year : 1992}, {year : 1993}]
      expect(() => DataStore.getFirstYear(1994)).toThrow()
    })

    it('Works if the target is the first element', () => {
      var data = [{year : 1991}, {year : 1991}, {year : 1992}, {year : 1993}]
      DataStore.data = data
      expect(DataStore.getFirstYear(1991)).toBe(0)
    })

    it('Works if the target is the last element', () => {
      var data = [{year : 1991}, {year : 1991}, {year : 1992}, {year : 1993}]
      DataStore.data = data
      expect(DataStore.getFirstYear(1993)).toBe(3)
    })
  })

  describe('getData', () => {
    var DataStore;

    beforeEach(() => {
      jest.resetModules()
      DataStore = require('../DataStore').default
    })

    it('Works with singleton targets', () => {
      var data = [{year : 1991}, {year : 1992}, {year : 1993}, {year : 1994}]
      DataStore.data = data
      DataStore.setYears()
      var result = DataStore.getData()
      expect(result.length).toBe(1)
      expect(result[0].year).toBe(1991)
    })

    it('Works with non-singleton targets', () => {
      var data = [{year : 1991}, {year : 1991}, {year : 1991}, {year : 1994}]
      DataStore.data = data
      DataStore.setYears()
      var result = DataStore.getData()
      expect(result.length).toBe(3)
      expect(result[0].year).toBe(result[1].year)
      expect(result[1].year).toBe(result[2].year)
    })
  })
})