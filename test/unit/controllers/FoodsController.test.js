/* global before afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { FoodItemModel } from '../../../src/models/FoodItem.js'
import { FoodsController } from '../../../src/controllers/FoodsController.js'
import createError from 'http-errors'

chai.use(sinonChai)
const expect = chai.expect

describe('FoodsController', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('index, should return items returned by FoodItemModel.listItems method', async () => {
    const foodsController = new FoodsController()

    const query = {}
    const req = {
      query
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const exp = {
      foodItems: [
        {
          ean: '1234567890123',
          name: 'Apple',
          brand: 'Brand A'
        },
        {
          ean: '2345678901234',
          name: 'Banana',
          brand: 'Brand B'
        }
      ],
      total: 10,
      page: 1,
      pageSize: 2,
      from: 1,
      to: 2
    }

    sinon.stub(FoodItemModel, 'listItems').resolves(exp)
    await foodsController.index(req, res, next)
    expect(FoodItemModel.listItems).to.have.been.calledWith(query)

    expect(res.json).to.have.been.calledWith(exp)

    expect(next.called).to.be.false
    expect(res.status).to.have.been.calledWith(200)
  })

  it('index, should call next with error when FoodItemModel.listItems throws an error', async () => {
    const foodsController = new FoodsController()

    const query = {}
    const req = {
      query
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const error = new Error()

    sinon.stub(FoodItemModel, 'listItems').rejects(error)
    await foodsController.index(req, res, next)
    expect(FoodItemModel.listItems).to.have.been.calledWith(query)
    expect(next).to.have.been.calledWith(error)

    expect(res.status).not.to.have.been.called
    expect(res.json).not.to.have.been.called
  })

  it('query, should return items returned by FoodItemModel.searchItems method', async () => {
    const foodsController = new FoodsController()

    const params = {
      search: 'äpple'
    }
    const req = {
      params
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const exp = {
      foodItems: [
        {
          ean: '1234567890123',
          name: 'Apple',
          brand: 'Brand A'
        },
        {
          ean: '2345678901234',
          name: 'Banana',
          brand: 'Brand B'
        }
      ],
      total: 10,
      page: 1,
      pageSize: 2,
      from: 1,
      to: 2,
      query: params.search
    }

    sinon.stub(FoodItemModel, 'searchItems').resolves(exp)
    await foodsController.search(req, res, next)
    expect(FoodItemModel.searchItems).to.have.been.calledWith({ query: params.search })

    expect(res.status).to.have.been.calledWith(200)

    expect(res.json).to.have.been.calledWith(exp)

    expect(next.called).to.be.false
  })

  it('search, should call next with error when FoodItemModel.listItems throws an error', async () => {
    const foodsController = new FoodsController()

    const params = {
      search: 'äpple'
    }
    const req = {
      params
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const error = new Error()

    sinon.stub(FoodItemModel, 'searchItems').rejects(error)
    await foodsController.search(req, res, next)
    expect(FoodItemModel.searchItems).to.have.been.calledWith({ query: params.search })

    expect(next).to.have.been.calledWith(error)
    expect(res.status).not.to.have.been.called
    expect(res.json).not.to.have.been.called
  })

  it('get, should return item returned by FoodItemModel.getByEan method', async () => {
    const foodsController = new FoodsController()
    const ean = '1234567890123'
    const req = {
      params: {
        ean
      }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const exp = {
      ean,
      name: 'Apple',
      brand: 'Brand A',
      kcal_100g: 100,
      macros: {
        protein: 1,
        fat: 0,
        carbohydrates: 20,
        fiber: 5,
        sugars: 10,
        saturatedFat: 0
      }
    }
    sinon.stub(FoodItemModel, 'getByEan').resolves(exp)
    await foodsController.get(req, res, next)
    expect(FoodItemModel.getByEan).to.have.been.calledWith(ean)
    expect(res.status).to.have.been.calledWith(200)
    expect(res.json).to.have.been.calledWith(exp)
    expect(next.called).to.be.false
  })

  it('get, should call next with error when FoodItemModel.getByEan throws an error', async () => {
    const foodsController = new FoodsController()
    const ean = '1234567890123'
    const req = {
      params: {
        ean
      }
    }
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    }
    const next = sinon.stub()
    const error = new Error()

    sinon.stub(FoodItemModel, 'getByEan').rejects(error)
    await foodsController.get(req, res, next)
    expect(FoodItemModel.getByEan).to.have.been.calledWith(ean)

    expect(next).to.have.been.calledWith(error)
    expect(res.status).not.to.have.been.called
    expect(res.json).not.to.have.been.called
  })
})
