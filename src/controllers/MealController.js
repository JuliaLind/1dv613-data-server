/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import { MealService } from '../services/MealService.js'
import { createHttpError } from './lib/functions.js'

/**
 * Encapsulates a controller.
 */
export class MealController {
  #mealService

  /**
   * Crates a new instance of the MealController.
   *
   * @param {MealService} mealService - service for communicating with the Meal Model
   */
  constructor (mealService = new MealService()) {
    this.#mealService = mealService
  }

  /**
   * Returns a paginated list of food items
   * in aplhabetical order by name.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      const meals = await this.#mealService.getByDate(req.params.date, req.user.id)
      res.status(200).json(meals)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new meal.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async post (req, res, next) {
    try {
      const doc = await this.#mealService.create(req.body, req.user.id)

      res.status(201).json(doc)
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Preloads a meal by id.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The id of the meal to load.
   * @returns {void}
   */
  async preload (req, res, next, id) {
    try {
      req.meal = await this.#mealService.getOne(id, req.user.id)
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Add food-item to a meal.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async addFoodItem (req, res, next) {
    try {
      const foodItemId = await this.#mealService.addFoodItem(req.meal, req.body)

      res.status(201).json(foodItemId)
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Update weight or unit of current food item
   * in a meal.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updFoodItem (req, res, next) {
    try {
      await this.#mealService.updFoodItem(req.meal, req.body)

      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Delete food-item from a meal.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delFoodItem (req, res, next) {
    try {
      this.#mealService.delFoodItem(req.meal, req.params.foodItemId)

      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Deletes a meal.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      this.#mealService.delete(req.meal)

      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Deletes all meals that belong to a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delByUserId (req, res, next) {
    try {
      await this.#mealService.delByUserId(req.params.user.id)

      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }
}
