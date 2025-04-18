/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import { MealModel } from '../../../src/models/Meal.js'
import { FoodItemModel } from '../../../src/models/FoodItem.js'

chai.use(sinonChai)
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
    expect(MealModel.find).to.have.been.calledWith({ date, userId })

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

    expect(FoodItemModel.getByEans).to.have.been.calledWith([ean])

    expect(doc.setFoodItems).to.have.been.calledWith(foodMap)
  })

  it('populateMany, should call on the getByEans method of FoodItemModel', async function () {
    const doc = new MealModel(meal)

    sinon.stub(FoodItemModel, 'getByEans').resolves(foodMap)
    sinon.stub(doc, 'setFoodItems')

    await MealModel.populateMany([doc])

    expect(FoodItemModel.getByEans).to.have.been.calledWith([ean])

    expect(doc.setFoodItems).to.have.been.calledWith(foodMap)
  })
})
