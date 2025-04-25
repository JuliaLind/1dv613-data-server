/**
 * Contains the user router.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import express from 'express'
import { UserController } from '../../controllers/UserController.js'

export const router = express.Router()
const userController = new UserController()

router.delete('/',
  (req, res, next) => userController.delete(req, res, next))
