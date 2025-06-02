/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import { FoodItemModel } from '../../../src/models/FoodItem.js'

chai.use(sinonChai)
chai.use(chaiAsPromised)
const expect = chai.expect

describe('FoodItemModel', () => {
  afterEach(() => {
    sinon.restore()
  })

  const foodItems = [
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
  ]

  it('listItems', async function () {
    const params = {
      page: 3,
      limit: 10
    }

    sinon.stub(FoodItemModel, 'find').returns({
      sort: sinon.stub().returns({
        skip: sinon.stub().returns({
          limit: sinon.stub().resolves(foodItems)
        })
      })
    })
    sinon.stub(FoodItemModel, 'countDocuments').resolves(foodItems.length + 10)

    const result = await FoodItemModel.listItems(params)
    expect(FoodItemModel.find).to.have.been.calledWith({}, 'ean name brand kcal_100g img.sm macros_100g')

    expect(FoodItemModel.find().sort).to.have.been.calledWith({ name: 1 })

    expect(FoodItemModel.find().sort().skip).to.have.been.calledWith((params.page - 1) * params.limit)

    expect(FoodItemModel.find().sort().skip().limit).to.have.been.calledWith(params.limit)

    expect(FoodItemModel.countDocuments.calledOnce).to.be.true
    expect(result).to.deep.equal({
      foodItems,
      total: foodItems.length + 10,
      page: params.page,
      pageSize: foodItems.length,
      from: 21,
      to: 20 + foodItems.length
    })
  })

  it('searchItems', async function () {
    const params = {
      page: 3,
      limit: 10,
      query: 'Brand'
    }

    const regex = new RegExp(params.query, 'i')
    const expectedQuery = {
      $or: [
        { name: regex },
        { brand: regex }
      ]
    }

    sinon.stub(FoodItemModel, 'listItems')
    const exp = {
      foodItems,
      total: foodItems.length + 10,
      page: params.page,
      pageSize: foodItems.length,
      from: 21,
      to: 20 + foodItems.length
    }

    FoodItemModel.listItems.withArgs(
      {
        page: params.page,
        limit: params.limit,
        query: expectedQuery
      }
    ).resolves(exp)
    const result = await FoodItemModel.searchItems(params)

    const args = FoodItemModel.listItems.firstCall.args[0]
    expect(args).to.have.property('page', params.page)
    expect(args).to.have.property('limit', params.limit)
    expect(args.query).to.deep.equal(expectedQuery)

    expect(result).to.deep.equal(exp)
  })

  it('transform toObject, should keep all fields except _id', () => {
    const foodItem = new FoodItemModel({
      ean: '1234567890123',
      name: 'Apple',
      brand: 'Brand A',
      kcal_100g: 52
    })
    expect(foodItem).to.have.property('_id')
    expect(foodItem).to.have.property('createdBy')
    const obj = foodItem.toObject()
    expect(obj).to.have.property('ean', '1234567890123')
    expect(obj).to.have.property('name', 'Apple')
    expect(obj).to.have.property('brand', 'Brand A')
    expect(obj).to.have.property('kcal_100g', 52)
    expect(obj).to.not.have.property('_id')
    expect(obj).to.not.have.property('createdBy')
  })

  it('getByEans, should return a map with ean codeas keys and food items as values', async () => {
    const eans = ['1234567890123', '2345678901234']
    const foodItems = [
      {
        ean: '1234567890123',
        toObject: sinon.stub().returns({
          ean: '1234567890123',
          name: 'Apple',
          brand: 'Brand A',
          kcal_100g: 52
        })
      },
      {
        ean: '2345678901234',
        toObject: sinon.stub().returns({
          ean: '2345678901234',
          name: 'Banana',
          brand: 'Brand B',
          kcal_100g: 89
        })
      }
    ]

    sinon.stub(FoodItemModel, 'find').resolves(foodItems)

    const result = await FoodItemModel.getByEans(eans)

    expect(result).to.be.an.instanceof(Map)
    expect(result.size).to.equal(2)
    expect(result.get('1234567890123')).to.deep.equal(foodItems[0].toObject())
    expect(result.get('2345678901234')).to.deep.equal(foodItems[1].toObject())
    expect(FoodItemModel.find.firstCall.args[0]).to.deep.equal({ ean: { $in: eans } })
    expect(FoodItemModel.find.firstCall.args[1]).to.equal('ean name brand kcal_100g macros_100g img.sm')
  })

  it('getByEan, should return a food item by ean', async () => {
    const ean = '1234567890123'
    const foodItem = {
      ean: '1234567890123',
      name: 'Apple',
      brand: 'Brand A',
      kcal_100g: 52
    }

    sinon.stub(FoodItemModel, 'findOne').resolves(foodItem)

    const result = await FoodItemModel.getByEan(ean)
    expect(result).to.equal(foodItem)
    expect(FoodItemModel.findOne).to.have.been.calledWith({ ean })
  })

  it('getByEan, should throw an error if food item is not found', async () => {
    const ean = '1234567890123'

    sinon.stub(FoodItemModel, 'findOne').resolves(null)

    expect(FoodItemModel.getByEan(ean)).to.be.rejected.then(err => {
      expect(err).to.have.property('statusCode', 404)
    })
  })
})
