/**
 * Contains the user router.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import express from 'express'
import { MealController } from '../../controllers/MealController.js'

export const router = express.Router()
const mealController = new MealController()

router.get('/date/:date',
  (req, res, next) => mealController.index(req, res, next))

router.param('id', (req, res, next, id) => mealController.preload(req, res, next, id))

router.patch('/:id/add/',
  (req, res, next) => mealController.addFoodItem(req, res, next))

router.patch('/:id/upd',
  (req, res, next) => mealController.updFoodItem(req, res, next))

router.patch('/:id/del/:foodItemId',
  (req, res, next) => mealController.delFoodItem(req, res, next))

router.delete('/:id',
  (req, res, next) => mealController.delete(req, res, next))

router.post('/',
  (req, res, next) => mealController.post(req, res, next))
