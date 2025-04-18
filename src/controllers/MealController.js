/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import { MealModel } from '../models/Meal.js'

/**
 * Encapsulates a controller.
 */
export class MealController {
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

      res.status(200).json(meals)
    } catch (error) {
      next(error)
    }
  }
}
