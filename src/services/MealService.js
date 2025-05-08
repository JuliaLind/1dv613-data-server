import mongoose from 'mongoose'
import createError from 'http-errors'
import { MealModel } from '../models/Meal.js'

/**
 *
 */
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

  /**
   *
   * @param date
   * @param userId
   */
  async getByDate (date, userId) {
    const meals = await MealModel.getByDate(date, userId)
    return Object.fromEntries(meals)
  }

  /**
   *
   * @param meal
   * @param userId
   */
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

  /**
   *
   * @param id
   * @param userId
   */
  async getOne (id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, 'Invalid meal id')
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

  /**
   *
   * @param meal
   * @param foodItem
   */
  async addFoodItem (meal, foodItem) {
    const length = meal.foodItems.push(foodItem)
    const foodItemId = meal.foodItems[length - 1]._id.toString()
    await this.#saveToDb(meal)
    return foodItemId
  }

  /**
   *
   * @param meal
   * @param foodData
   */
  async updFoodItem (meal, foodData) {
    const { weight, unit, id } = foodData
    const foodItem = meal.foodItems.id(id)
    if (foodItem) {
      foodItem.weight = weight
      foodItem.unit = unit
    }

    await this.#saveToDb(meal)
  }

  /**
   *
   * @param meal
   * @param foodItemId
   */
  async delFoodItem (meal, foodItemId) {
    meal.foodItems.pull(foodItemId)

    this.#saveToDb(meal)
  }

  /**
   *
   * @param meal
   */
  async delete (meal) {
    await meal.deleteOne()
  }

  /**
   *
   * @param userId
   */
  async delByUserId (userId) {
    await MealModel.deleteMany({
      userId
    })
  }
}
