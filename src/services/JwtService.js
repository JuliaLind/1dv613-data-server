/**
 * Contains the JwtService class.
 * Responsible for verifying and decoding JSON Web Tokens (JWTs).
 *
 * @author Mats Loock
 * @author Julia Lind
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken'

/**
 * Exposes methods for working with JSON Web Tokens (JWTs).
 */
export class JwtService {
  /**
   * Decodes a JWT and returns the user object extracted from the payload.
   *
   * @param {string} token - The JWT to decode.
   * @param {string} key - The secret key used for verifying the JWT.
   * @returns {Promise<object>} A Promise that resolves to the user object extracted from the JWT payload.
   */
  static async decodeUser (token, key) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, key, (error, decoded) => {
        if (error) {
          reject(error)
          return
        }

        const user = decoded.user

        resolve(user)
      })
    })
  }
}
