/**
 * Contains the main images route.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import express from 'express'
import { router as foodsRouter } from './foods.js'
import { router as mealsRouter } from './meals.js'
import { router as userRouter } from './user.js'
import { authenticateJWT } from '../../middleware/auth.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from '../../config/swagger.js'

export const router = express.Router()

router.use('/foods',
  foodsRouter)

router.use('/meals',
  authenticateJWT,
  mealsRouter)

router.use('/user',
  authenticateJWT,
  userRouter)

router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

router.get('/',
  (req, res) => {
    res.status(200).json({
      message: 'Welcome to the data server API v1',
      version: '1.0.0',
      documentation: '/swagger/'
    })
  })
