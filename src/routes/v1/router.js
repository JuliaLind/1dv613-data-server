/**
 * Contains the main images route.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import express from 'express'
import { router as foodsRouter } from './foods.js'
// import { authenticateJWT } from '../../middleware/auth.js'

export const router = express.Router()

router.use('/foods',
  // authenticateJWT,
  foodsRouter)

router.get('/',
  (req, res) => {
    res.status(200).json({
      message: 'Welcome to the data server API',
      version: '1.0.0'
    })
  })
