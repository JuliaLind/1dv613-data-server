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
export class UserController {
  /**
   * Deletes all data for a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await MealModel.deleteMany({
        userId: req.user.id
      })

      res.status(204).end()
    } catch (error) {
      next(this.handleError(error))
    }
  }

  // TODO add routes for creating, updating and deleting user data + add routes and schema to swagger
}
