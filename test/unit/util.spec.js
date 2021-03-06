'use strict'

/**
 * adonis-lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/* global describe, it */
const util = require('../../lib/util')
const path = require('path')
const _ = require('lodash')
const chai = require('chai')
const expect = chai.expect

describe('Utils', function () {
  it('should make plural collection for a given model', function () {
    class Person {}
    const collectionName = util.makeCollectionName(Person)
    expect(collectionName).to.equal('people')
  })

  it('should convert CamelCase models collection to underscore collection names', function () {
    class LineItem {}
    const collectionName = util.makeCollectionName(LineItem)
    expect(collectionName).to.equal('line_items')
  })

  it('should convert proper plural names', function () {
    class Mouse {}
    const collectionName = util.makeCollectionName(Mouse)
    expect(collectionName).to.equal('mice')
  })

  it('should make model foriegn key', function () {
    class Mouse {}
    const foreignKey = util.makeForeignKey(Mouse)
    expect(foreignKey).to.equal('mouse_id')
  })

  it('should make model foriegn key to underscore when model name is CamelCase', function () {
    class LineItems {}
    const foreignKey = util.makeForeignKey(LineItems)
    expect(foreignKey).to.equal('line_item_id')
  })

  it('should make getter name for a given field', function () {
    const field = '_id'
    const idGetter = util.makeGetterName(field)
    expect(idGetter).to.equal('getId')
  })

  it('should make getter name for a given field with snake case name', function () {
    const field = 'user_name'
    const idGetter = util.makeGetterName(field)
    expect(idGetter).to.equal('getUserName')
  })

  it('should make getter name for a given field with dash case name', function () {
    const field = 'first-name'
    const idGetter = util.makeGetterName(field)
    expect(idGetter).to.equal('getFirstName')
  })

  it('should return offset to be used inside a query for a given page', function () {
    const offset = util.returnOffset(1, 20)
    expect(offset).to.equal(0)
    const pageNextOffset = util.returnOffset(2, 20)
    expect(pageNextOffset).to.equal(20)
    const pageThirdOffset = util.returnOffset(3, 20)
    expect(pageThirdOffset).to.equal(40)
    const pageLastOffset = util.returnOffset(100, 20)
    expect(pageLastOffset).to.equal(1980)
  })

  it('return a new array with values of defined key', function () {
    const original = [
      {
        username: 'foo',
        age: 22
      },
      {
        username: 'bar',
        age: 24
      }
    ]
    const transformed = util.mapValuesForAKey(original, 'username')
    expect(transformed).deep.equal(['foo', 'bar'])
  })

  it('should return error when page number is less than zero', function () {
    const fn = function () {
      return util.validatePage(0)
    }
    expect(fn).to.throw(/cannot paginate results for page less than 1/)
  })

  it('should return error when page number is not a number than zero', function () {
    const fn = function () {
      return util.validatePage('1')
    }
    expect(fn).to.throw(/page parameter is required to paginate results/)
  })

  it('should make paginate meta data when total results are zero', function () {
    const meta = util.makePaginateMeta(0, 1, 10)
    expect(meta).deep.equal({total: 0, perPage: 10, currentPage: 1, lastPage: 0, data: []})
  })

  it('should make paginate meta data when total results are more than zero', function () {
    const meta = util.makePaginateMeta(20, 1, 10)
    expect(meta).deep.equal({total: 20, perPage: 10, currentPage: 1, lastPage: 2, data: []})
  })

  it('should add a mixin to lodash isolated instance', function () {
    const foo = function () {}
    util.addMixin('foo', foo)
    expect(_.isFunction(_.foo)).to.equal(false)
    expect(_.isFunction(util.lodash().foo)).to.equal(true)
  })

  it('should make a pivot collection name for two models', function () {
    class Student {}
    class Course {}
    const pivotCollection = util.makePivotCollectionName(Student, Course)
    expect(pivotCollection).to.equal('course_student')
  })

  it('should make a pivot collection name for two models when model names are plural', function () {
    class Students {}
    class Courses {}
    const pivotCollection = util.makePivotCollectionName(Students, Courses)
    expect(pivotCollection).to.equal('course_student')
  })

  it('should make a pivot collection name for two models when model name is in pascal case', function () {
    class AdminUsers {}
    class Roles {}
    const pivotCollection = util.makePivotCollectionName(AdminUsers, Roles)
    expect(pivotCollection).to.equal('admin_user_role')
  })

  it('should make proper pivotCollection key name for a given model', function () {
    class AdminUser {}
    const pivotKey = util.makePivotModelKey(AdminUser)
    expect(pivotKey).to.equal('admin_user_id')
  })

  it('should make proper pivotCollection key name for a given model when model name is plural', function () {
    class AdminUsers {}
    const pivotKey = util.makePivotModelKey(AdminUsers)
    expect(pivotKey).to.equal('admin_user_id')
  })

  it('should load all .js files from a given directory', function () {
    const files = util.loadJsFiles(path.join(__dirname, './autoload'))
    expect(Object.keys(files)).deep.equal(['foo', 'paths'])
  })

  it('should load only selected .js files from a given directory', function () {
    const files = util.loadJsFiles(path.join(__dirname, './autoload'), ['foo.js'])
    expect(Object.keys(files)).deep.equal(['foo'])
  })
})
