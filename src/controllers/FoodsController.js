/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import createError from 'http-errors'
import { FoodItemModel } from '../models/FoodItem.js'

/**
 * Encapsulates a controller.
 */
export class FoodsController {
  errors = {
    pag: 'Invalid page or limit',
    notFound: 'Food item not found'
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
    try {
      const foodItems = await FoodItemModel.listItems(req.query)

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
    try {
      const searchResult = await FoodItemModel.searchItems(req.query)
      const data = {
        ...searchResult,
        query: req.query
      }

      res.status(200).json(data)
    } catch (error) {
      next(this.handleError(error))
    }
  }

  /**
   * Gets a food item by ean.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async get (req, res, next) {
    const { ean } = req.params

    try {
      const foodItem = await FoodItemModel.getByEan(ean)
      res.status(200).json(foodItem)
    } catch (error) {
      next(error)
    }
  }
}
