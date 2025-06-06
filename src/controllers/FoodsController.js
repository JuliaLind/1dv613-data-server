/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import { FoodItemModel } from '../models/FoodItem.js'
import { createHttpError } from './lib/functions.js'

/**
 * Encapsulates a controller.
 */
export class FoodsController {
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
      next(error)
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
      const searchResult = await FoodItemModel.searchItems({
        ...req.query,
        query: req.params.search
      })
      const data = {
        ...searchResult,
        query: req.params.search
      }

      res.status(200).json(data)
    } catch (error) {
      next(error)
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

  /**
   * Creates a new food item.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async post (req, res, next) {
    try {
      const foodItem = await FoodItemModel.create({
        ...req.body,
        createdBy: req.user.id
      })
      res.status(201).json(foodItem)
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Creates a new food item.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await FoodItemModel.deleteByEan(req.params.ean, req.user.id)

      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }
}
