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
