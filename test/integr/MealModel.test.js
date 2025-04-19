/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import {connectDB } from '../../src/config/mongoose.js'
import mongoose from 'mongoose'
import { MealModel } from '../../src/models/Meal.js'
import { FoodItemModel } from '../../src/models/FoodItem.js'
import { products } from './products.js'

chai.use(sinonChai)
const expect = chai.expect

describe('MealModel', () => {
  let mealDoc
  const date = '2023-10-01'
  const type = 'breakfast'
  const userId = 'someUserId'
  const meal = {
    userId,
    type,
    date,
    foodItems: [{
      ean: products[0].ean,
      weight: 200,
      unit: 'g'
    }]
  }


  before(async () => {
    await connectDB(process.env.DB_CONNECTION_STRING)
    await FoodItemModel.insertMany(products)
    mealDoc = await MealModel.create(meal)
  })

  after (async () => {
    await FoodItemModel.deleteMany({})
    await MealModel.deleteMany({})
    await mongoose.connection.close()
  })

  it('getByDate, should search for meals by date and userid', async function () {
    const meals = await MealModel.getByDate(date, userId)
    const created = meals.get(type)
    const food = created.foodItems[0]
    expect(food.ean).to.deep.equal(meal.foodItems[0].ean)
    expect(food.weight).to.deep.equal(meal.foodItems[0].weight)
    expect(food.unit).to.deep.equal(meal.foodItems[0].unit)
    expect(food).to.not.have.property('userId')
  })
})