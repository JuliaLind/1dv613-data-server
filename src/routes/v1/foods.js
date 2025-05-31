/**
 * Contains the images routes.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import express from 'express'
import { FoodsController } from '../../controllers/FoodsController.js'
import { authenticateJWT } from '../../middleware/auth.js'

export const router = express.Router()

// export for testing
export const foodsController = new FoodsController()

router.get('/',
  (req, res, next) => foodsController.index(req, res, next))

router.get('/search/:search',
  (req, res, next) => foodsController.search(req, res, next))

router.get('/ean/:ean', (req, res, next) => foodsController.get(req, res, next))

router.post('/',
  authenticateJWT,
  (req, res, next) => foodsController.post(req, res, next))
