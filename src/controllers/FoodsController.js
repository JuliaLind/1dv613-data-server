/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import createError from 'http-errors'
import { FoodItemModel } from '../models/FoodItemModel.js'

/**
 * Encapsulates a controller.
 */
export class FoodController {
  errors = {
    pag: 'Invalid page or limit'
  }

  /**
   * Creates a HTML error based on what went wrong.
   *
   * @param {Error} error - the error from the database.
   * @returns {Error} - the error to send in the response.
   */
  handleError (error) {
    if (error.name === 'CastError') {
      return createError(400, this.errors.pag)
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
    const { page = 1, limit = 30 } = req.query

    try {
      const foodItems = await FoodItemModel.listItems(page, limit)

      res.status(200).json(foodItems)
    } catch (error) {
      next(this.handleError(error))
    }
  }

  /**
   * Returns a paginated list of food items
   * in alphabetical order by name where name
   * or brand is a partial match to the query.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async search (req, res, next) {
    const { page = 1, limit = 30, query } = req.query

    try {
      const foodItems = await FoodItemModel.searchItems(page, limit, query)

      res.status(200).json(foodItems)
    } catch (error) {
      next(this.handleError(error))
    }
  }
}
