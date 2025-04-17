/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import { FoodItemModel } from '../../../src/models/FoodItemModel.js'

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
    const page = 3
    const limit = 10

    sinon.stub(FoodItemModel, 'find').returns({
      sort: sinon.stub().returns({
        skip: sinon.stub().returns({
          limit: sinon.stub().resolves(foodItems)
        })
      })
    })
    sinon.stub(FoodItemModel, 'countDocuments').resolves(foodItems.length + 10)

    const result = await FoodItemModel.listItems(page, limit)
    expect(FoodItemModel.find.calledOnce).to.be.true
    expect(FoodItemModel.find.firstCall.args[0]).to.deep.equal({})
    expect(FoodItemModel.find.firstCall.args[1]).to.equal('ean name brand')
    expect(FoodItemModel.find().sort.calledOnce).to.be.true
    expect(FoodItemModel.find().sort.firstCall.args[0]).to.deep.equal({ name: 1 })
    expect(FoodItemModel.find().sort().skip.calledOnce).to.be.true
    expect(FoodItemModel.find().sort().skip.firstCall.args[0]).to.equal((page - 1) * limit)
    expect(FoodItemModel.find().sort().skip().limit.calledOnce).to.be.true
    expect(FoodItemModel.find().sort().skip().limit.firstCall.args[0]).to.equal(limit)
    expect(FoodItemModel.countDocuments.calledOnce).to.be.true
    expect(result).to.deep.equal({
      foodItems,
      total: foodItems.length + 10,
      page,
      pageSize: foodItems.length,
      from: 21,
      to: 20 + foodItems.length
    })
  })

  it('searchItems', async function () {
    const page = 3
    const limit = 10


    const query = 'Brand'
    const regex = new RegExp(query, 'i')
    const expectedQuery = {
      $or: [
        { name: regex },
        { brand: regex }
      ]
    }
    const listItemsStub = sinon.stub(FoodItemModel, 'listItems')
    const exp = {
      foodItems,
      total: foodItems.length + 10,
      page,
      pageSize: foodItems.length,
      from: 21,
      to: 20 + foodItems.length
    }
    listItemsStub.withArgs(page, limit, expectedQuery).resolves(exp)
    const result = await FoodItemModel.searchItems(page, limit, query)
    expect(listItemsStub.calledOnce).to.be.true
    expect(listItemsStub.firstCall.args[0]).to.equal(page)
    expect(listItemsStub.firstCall.args[1]).to.equal(limit)
    expect(listItemsStub.firstCall.args[2]).to.deep.equal(expectedQuery)
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
    const obj = foodItem.toObject()
    expect(obj).to.have.property('ean', '1234567890123')
    expect(obj).to.have.property('name', 'Apple')
    expect(obj).to.have.property('brand', 'Brand A')
    expect(obj).to.have.property('kcal_100g', 52)
    expect(obj).to.not.have.property('_id')
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
    expect(FoodItemModel.find.firstCall.args[1]).to.equal('ean name brand kcal_100g')
  })
})
