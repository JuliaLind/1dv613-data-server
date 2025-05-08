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
  (req, res, next) => userController.preLoad(req, res, next),
  (req, res, next) => userController.delete(req, res, next))

router.get('/',
  (req, res, next) => userController.preLoad(req, res, next),
  (req, res) => {
    res.status(200).json(req.doc)
  })

router.put('/',
  (req, res, next) => userController.preLoad(req, res, next),
  (req, res, next) => userController.put(req, res, next))

router.post('/',
  (req, res, next) => userController.post(req, res, next))
