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
    date,
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

  it('transform toObject, should contain id as string', function () {
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

  describe('setFoodItems', () => {
    it('should update foodItems with matching items from foodMap', () => {
      const doc = new MealModel({
        date: new Date(),
        type: 'breakfast',
        userId: 'userId',
        foodItems: [
          { ean: '7350126082712', weight: 100, unit: 'g' },
          { ean: '7350029731557', weight: 200, unit: 'g' }
        ]
      })

      const foodMap = new Map([
        ['7350126082712',
          {
            name: 'Apple',
            kcal_100g: 52,
            img: { sm: 'apple.jpg' },
            macros_100g: {
              saturatedFat: 0,
              protein: 0,
              fat: 0,
              fiber: 0,
              sugars: 0,
              salt: 0,
              carbohydrates: 14
            }
          }],
        ['7350029731557',
          {
            name: 'Banana',
            kcal_100g: 89,
            img: { sm: 'banana.jpg' },
            macros_100g: {
              protein: 0,
              fat: 0,
              fiber: 0,
              sugars: 0,
              salt: 0,
              carbohydrates: 0,
              saturatedFat: 0.3
            }
          }
        ]])

      doc.setFoodItems(foodMap)

      expect(doc.foodItems.length).to.equal(2)
      const item1 = doc.foodItems[0].toObject()
      const item2 = doc.foodItems[1].toObject()

      for (const field of ['_id', 'id']) {
        delete item1[field]
        delete item2[field]
      }
      expect(item1).to.deep
        .equal({
          ean: '7350126082712',
          name: 'Apple',
          weight: 100,
          unit: 'g',
          kcal_100g: 52,
          img: { sm: 'apple.jpg' },
          macros_100g: {
            saturatedFat: 0,
            protein: 0,
            fat: 0,
            fiber: 0,
            sugars: 0,
            salt: 0,
            carbohydrates: 14
          }
        })

      expect(item2).to.deep
        .equal({
          ean: '7350029731557',
          name: 'Banana',
          weight: 200,
          unit: 'g',
          kcal_100g: 89,
          img: { sm: 'banana.jpg' },
          macros_100g: {
            protein: 0,
            fat: 0,
            fiber: 0,
            sugars: 0,
            salt: 0,
            carbohydrates: 0,
            saturatedFat: 0.3
          }
        })
    })
  })
})
