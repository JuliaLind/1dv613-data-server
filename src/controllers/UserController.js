/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import { UserModel } from '../models/User.js'
import { MealModel } from '../models/Meal.js'
import createError from 'http-errors'
import { createHttpError } from './lib/functions.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Deletes all data for a user, including all meals.
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

      await req.doc.deleteOne()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Preloads the user data.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>}
   */
  async preLoad (req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id)

      if (!user) {
        return next(createError('No user data registered', 404))
      }

      req.doc = user
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new user data document in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async post (req, res, next) {
    try {
      const user = new UserModel({
        userId: req.user.id,
        ...req.body
      })

      await user.save()

      res.status(201).json({
        id: user._id
      })
    } catch (error) {
      next(createHttpError(error))
    }
  }

  /**
   * Updates the user data in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async put (req, res, next) {
    Object.assign(req.doc, req.body)
    try {
      await req.doc.save()
      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }
}
