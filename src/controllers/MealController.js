/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import { MealModel } from '../models/Meal.js'
import createError from 'http-errors'
import mongoose from 'mongoose'

/**
 * Encapsulates a controller.
 */
export class MealController {
  handleError (error) {
    if (error.code === 11000) {
      return createError(409)
    }

    if (error.errors) {
      return createError(400)
    }

    return createError(500)
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
      const meals = await MealModel.getByDate(req.params.date, req.user.id)

      res.status(200).json(Object.fromEntries(meals))
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
      const meal = {
        ...req.body,
        userId: req.user.id
      }

      /**
       * @type {import('mongoose').Document & { populateFoods: () => Promise<void> }}
       */
      const doc = await MealModel.create(meal)
      await doc.populateFoods()

      res.status(201).json(doc)
    } catch (error) {
      next(error)
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createError(400, 'Invalid meal id'))
      }

      const meal = await MealModel.findOne(
        {
          _id: id,
          userId: req.user.id
        }
      )

      if (!meal) {
        return next(createError(404, 'Meal not found'))
      }

      req.meal = meal
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
      const meal = req.meal
      const length = meal.foodItems.push(req.body)
      const newId = meal.foodItems[length - 1]._id.toString()

      if (meal.isModified()) {
        await meal.save()
      }

      res.status(201).json(newId)
    } catch (error) {
      next(this.handleError(error))
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
      const meal = req.meal
      const { weight, unit, id } = req.body
      const foodItem = meal.foodItems.id(id)
      if (foodItem) {
        foodItem.weight = weight
        foodItem.unit = unit
      }

      if (meal.isModified()) {
        await meal.save()
      }
      res.status(204).end()
    } catch (error) {
      next(this.handleError(error))
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
      const meal = req.meal

      meal.foodItems.pull(req.params.foodItemId)
      if (meal.isModified()) {
        await meal.save()
      }

      res.status(204).end()
    } catch (error) {
      next(this.handleError(error))
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
      const meal = req.meal
      await meal.deleteOne()

      res.status(204).end()
    } catch (error) {
      next(this.handleError(error))
    }
  }
}
