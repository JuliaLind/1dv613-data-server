/**
 * Contains the main router.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import createError from 'http-errors'
import express from 'express'
import { router as v1Router } from './v1/router.js'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from '../config/swagger.js'

export const router = express.Router()

router.use('/api/v1', v1Router)
router.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

router.get('/',
  (req, res) => {
    res.status(200).json({
      message: 'Welcome to the data server API',
      documentation: '/swagger/'
    })
  })

router.use((req, res, next) => {
  next(createError(404))
})
