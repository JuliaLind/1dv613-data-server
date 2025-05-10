/**
 * Module for the UserController.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import { createHttpError } from './lib/functions.js'
import { UserService } from '../services/UserService.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  #userService

  /**
   * Creates a new instance of the UserController.
   *
   * @param {UserService} userService - service for communicating with the User Model
   */
  constructor (userService = new UserService()) {
    this.#userService = userService
  }

  /**
   * Deletes the user data from the database. Does not delete the meals of the user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await this.#userService.delete(req.doc)

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
      req.doc = await this.#userService.findOne(req.user.id)
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
      res.status(201).json({
        id: await this.#userService.create(req.body, req.user.id)
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
    try {
      await this.#userService.upd(req.doc, req.body)
      res.status(204).end()
    } catch (error) {
      next(createHttpError(error))
    }
  }
}
