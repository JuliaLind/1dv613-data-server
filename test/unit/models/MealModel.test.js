/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import { MealModel } from '../../../src/models/MealModel.js'
import { FoodItemModel } from '../../../src/models/FoodItemModel.js'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('MealModel', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('getByDate, should search for meals by date and userid', async function () {
    const date = '2023-10-01'
    const type = 'breakfast'
    const meal = {
      type: 'breakfast',
      toObject: sinon.stub().returns({
        id: 'someid',
        date,
        type,
        foodItems: [{
          ean: '1234567890123',
          weight: 100,
          unit: 'g'
        }]
      })
    }
    const userId = 'someUserId'

    sinon.stub(MealModel, 'find').resolves([meal])
    const mealMap = await MealModel.getByDate(date, userId)
    expect(MealModel.find.calledOnce).to.be.true
    expect(MealModel.find.firstCall.args[0]).to.deep.equal({ date, userId })

    expect(mealMap).to.be.an.instanceOf(Map)
    expect(mealMap.size).to.equal(1)
    expect(mealMap.get(type)).to.be.deep.equal(meal.toObject())
  })

  const date = '2023-10-01'
  const type = 'breakfast'
  const ean = '7331495009104'
  const meal = {
    userId: 'someUserId',
    date: new Date(date),
    type,
    foodItems: [{
      ean,
      weight: 100,
      unit: 'g'
    }]
  }

  const foodMap = new Map()
  foodMap.set(ean, {
    ean,
    name: 'Some Food',
    brand: 'Some Brand',
    kcal_100g: 100
  })

  it('transform toObject, should contain id as string and date as string', function () {
    const doc = new MealModel(meal)
    expect(doc).to.have.property('_id')
    const obj = doc.toObject()
    expect(obj).to.have.property('id')
    expect(obj).to.have.property('date', date)
    expect(obj).to.not.have.property('_id')
    expect(obj).to.have.property('foodItems')
    expect(obj.foodItems).to.be.an('array')
    expect(obj).to.have.property('type', type)
  })

  it('populateFoods, should call on the getByEans method of FoodItemModel', async function () {

    const doc = new MealModel(meal)


    sinon.stub(FoodItemModel, 'getByEans').resolves(foodMap)
    sinon.stub(doc, 'setFoodItems')

    await doc.populateFoods()
    expect(FoodItemModel.getByEans.calledOnce).to.be.true
    expect(FoodItemModel.getByEans.firstCall.args[0]).to.deep.equal([ean])
    expect(doc.setFoodItems.calledOnce).to.be.true
    expect(doc.setFoodItems.firstCall.args[0]).to.deep.equal(foodMap)
  })

  it('populateMany, should call on the getByEans method of FoodItemModel', async function () {
    const doc = new MealModel(meal)

    sinon.stub(FoodItemModel, 'getByEans').resolves(foodMap)
    sinon.stub(doc, 'setFoodItems')

    await MealModel.populateMany([doc])
    expect(FoodItemModel.getByEans.calledOnce).to.be.true
    expect(FoodItemModel.getByEans.firstCall.args[0]).to.deep.equal([ean])
    expect(doc.setFoodItems.calledOnce).to.be.true
    expect(doc.setFoodItems.firstCall.args[0]).to.deep.equal(foodMap)
  })

  it('setFoodItems, should set foodItems to the given map', function () {
    const doc = new MealModel(meal)
    doc.setFoodItems(foodMap)
    // let obj = doc.toObject()
    expect(doc.foodItems).to.be.an('array')
    expect(doc.foodItems).to.have.lengthOf(1)
    expect(doc.foodItems[0]).to.have.property('ean', ean)
    expect(doc.foodItems[0]).to.have.property('weight', 100)
    expect(doc.foodItems[0]).to.have.property('unit', 'g')
    expect(doc.foodItems[0]).to.have.property('brand', 'Some Brand')
    expect(doc.foodItems[0]).to.have.property('kcal_100g', 100)
    expect(doc.foodItems[0]).to.have.property('id', ean)
    expect(doc.foodItems[0]).to.have.property('date', date)
    expect(doc.foodItems[0]).to.have.property('type', type)
    expect(doc.foodItems[0]).to.have.property('userId', 'someUserId')
    expect(doc.foodItems[0]).to.have.property('unit', 'g')
    expect(doc.foodItems[0]).to.have.property('weight', 100)
    expect(doc.foodItems[0]).to.have.property('kcal_100g', 100)
  })
})
