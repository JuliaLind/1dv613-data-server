import mongoose from 'mongoose'
import createError from 'http-errors'
import { MealModel } from '../models/Meal.js'

/**
 * Service for managing meals.
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
   * Gets all meals for a given date and the given user.
   *
   * @param {string} date - the date to get meals from
   * @param {string} userId - id of the user
   * @returns {Promise<Map<string,object>>} - a map of meal types to meal objects
   */
  async getByDate (date, userId) {
    const meals = await MealModel.getByDate(date, userId)
    return Object.fromEntries(meals)
  }

  /**
   * Creates a new meal for a user.
   *
   * @param {object} meal - associative array of meal data
   * @param {string} userId - id of the user
   * @returns { Promise<object>} - the new meal document
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
   * Gets a meal by id and userId.
   *
   * @param {string} id - id of the meal to get
   * @param {string} userId - id of the user
   * @returns {Promise<object>} - the meal object
   */
  async getOne (id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, 'Invalid meal id')
    }

    // search for the meal by id and userId
    // to ensure user can't access meals of other users
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
   * Adds a new food item to a meal.
   *
   * @param {object} meal - mongoose meal document
   * @param {object} foodItem - associative array of food item data
   * @returns {Promise<string>} - the id of the new food item
   */
  async addFoodItem (meal, foodItem) {
    const { ean, weight, unit } = foodItem
    const length = meal.foodItems.push({ ean, weight, unit })
    const foodItemId = meal.foodItems[length - 1]._id.toString()
    await this.#saveToDb(meal)
    return foodItemId
  }

  /**
   * Updates the weight or unit of a food item in a meal.
   *
   * @param {object} meal - mongoose meal document
   * @param {object} foodData - associative array of food item data
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
   * Deletes a food item from a meal.
   *
   * @param {object} meal - mongoose meal document
   * @param {string} foodItemId - id of the food item to delete
   */
  async delFoodItem (meal, foodItemId) {
    meal.foodItems.pull(foodItemId)

    this.#saveToDb(meal)
  }

  /**
   * Deletes a meal.
   *
   * @param {object} meal - mongoose meal document
   */
  async delete (meal) {
    await meal.deleteOne()
  }

  /**
   * Deletes all meals that belong to the user.
   *
   * @param {string} userId - the user id
   */
  async delByUserId (userId) {
    await MealModel.deleteMany({
      userId
    })
  }
}
