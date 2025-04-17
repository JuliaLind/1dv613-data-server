/**
 * @module validators
 * @description This module contains validators for various fields.
 */

import validator from 'validator'

export const urlValidator = {
/**
 * Validates the url field.
 *
 * @param {string} value - the url to validate.
 * @returns {boolean} - true if the value is valid, false otherwise.
 * @throws {Error} - if the value is not valid.
 */
  validator: (value) => {
    return validator.isURL(value)
  },
  message: 'Invalid image URL'
}


export const eanValidator = {
  /**
   * Validates the ean field.
   *
   * @param {string} value - the ean to validate.
   * @returns {boolean} - true if the value is valid, false otherwise.
   */
  validator: (value) => {
    return validator.isEAN(value)
  },
  message: 'Invalid EAN code'
}

export const dateValidator = {
  /**
   * Validates the date field.
   *
   * @param {string} value - the date to validate.
   * @returns {boolean} - true if the value is valid, false otherwise.
   */
  validator: (value) => {
    return validator.isDate(value)
  },
  message: 'Invalid date'
}
