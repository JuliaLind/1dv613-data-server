/**
 * Contains the main images route.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import express from 'express'
import { router as foodsRouter } from './foodsRouter.js'
import { authenticateJWT } from '../../../middlewares/auth.js'

export const router = express.Router()

router.use('/foods',
  authenticateJWT,
  foodsRouter)
