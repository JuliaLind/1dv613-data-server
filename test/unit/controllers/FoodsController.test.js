/* global before afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import { FoodItemModel } from '../../../src/models/FoodItem.js'
import { FoodsController } from '../../../src/controllers/FoodsController.js'
import createError from 'http-errors'

const expect = chai.expect

// describe('FoodsController', () => {
//   afterEach(() => {
//     sinon.restore()
//   })

//   it(''
