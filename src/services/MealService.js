import mongoose from 'mongoose'
import createError from 'http-errors'
import { MealModel } from '../models/Meal.js'

export class MealService {
  /**
   * If the document is modified, save it to the database.
   *
   * @param {object} doc - The document to save.
   */
  async #saveToDb (doc) {
    if (doc.isModified()) {
      await doc.save()
    }
  }

  async getByDate (date, userId) {
    const meals = await MealModel.find({ date, userId })

    return Object.fromEntries(meals)
  }

  async create (meal, userId) {
    /**
     * @type {import('mongoose').Document & { populateFoods: () => Promise<void> }}
     */
    const doc = await MealModel.create({
      ...meal,
      userId
    })
    await doc.populateFoods()
    return doc
  }

  async getOne(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, 'Invalid meal id'))
    }

    const meal = await MealModel.findOne(
      {
        _id: id,
        userId
      }
    )

    if (!meal) {
      throw createError(404, 'Meal not found')
    }

    return meal
  }

  async addFoodItem (meal, foodItem) {
    const length = meal.foodItems.push(foodItem)
    const foodItemId = meal.foodItems[length - 1]._id.toString()
    await this.#saveToDb(meal)
    return foodItemId
  }

  async updFoodItem (meal, foodData ) {
    const { weight, unit, id } = foodData
    const foodItem = meal.foodItems.id(id)
    if (foodItem) {
      foodItem.weight = weight
      foodItem.unit = unit
    }

    await this.#saveToDb(meal)
  }

  async delFoodItem (meal, foodItemId) {
    meal.foodItems.pull(foodItemId)

    this.#saveToDb(meal)
  }

  async delete (meal) {
    await meal.deleteOne()
  }

  async delByUserId (userId) {
    await MealModel.deleteMany({
      userId
    })
  }
}