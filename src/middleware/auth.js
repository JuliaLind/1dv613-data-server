import createError from 'http-errors'
import { JwtService } from '../services/JwtService.js'

/**
 * Authenticates a request based on a JSON Web Token (JWT).
 *
 * This middleware checks the authorization header of the request, verifies the authentication scheme,
 * decodes the JWT using the provided secret key, and attaches the decoded user object to the `req.user` property.
 * If the authentication fails, an unauthorized response with a 401 Unauthorized status code is sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization.split(' ')
    req.user = await extractUser(authorization)

    next()
  } catch (error) {
    console.error(error.message)
    next(createError(401, 'Access token invalid or not provided.'))
  }
}

/**
 * Extracts the userId from the token in the request header.
 *
 * @param {string[]} authorization - contains the authorization type and token
 * @returns {object} user if the token and type is valid
 */
async function extractUser (authorization) {
  if (authorization[0]?.toLowerCase() === 'bearer') {
    const token = authorization[1]
    // will throw error if token is invalid
    const user = await JwtService.decodeUser(token, process.env.ACCESS_TOKEN_SECRET)

    return user
  }
  throw new Error('Invalid token')
}
