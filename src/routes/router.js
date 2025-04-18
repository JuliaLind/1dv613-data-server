/**
 * Contains the main router.
 *
 * @author Julia Lind
 * @version 1.0.0
 */
import createError from 'http-errors'
import express from 'express'
import { router as v1Router } from './v1/router.js'

export const router = express.Router()

router.use('/v1', v1Router)

router.use((req, res, next) => {
  next(createError(404))
})
