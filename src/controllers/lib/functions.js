import createError from 'http-errors'

/**
 * Creates a HTML error for the response
 * based on what went wrong.
 *
 * @param {Error} error - the error from the database.
 * @returns {Error} - the error to send in the response.
 */
export function createHttpError (error) {
  if (error instanceof createError.HttpError) {
    return error
  }

  if (error.code === 11000) {
    return createError(409)
  }

  if (error.errors) {
    return createError(400)
  }

  return createError(500)
}
