/**
 * Mongoose model FoodItem.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'

const convertOptions = Object.freeze({
  getters: true,
  versionKey: false,
  /**
   * Removes some of the parameters when
   * transforming document into object or json.
   *
   * @param {object} doc - the original mongodb document
   * @param {object} ret - the transformed object
   * @returns {object} - the transformed object
   */
  transform: (doc, ret) => {
    // ret.id = ret._id.toString()
    delete ret._id

    return ret
  }
})

const urlValidator = {
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

const nrValidator = {
  /**
   * Validates the numeric value.
   *
   * @param {string} value - the value to validate.
   * @returns {boolean} - true if the value is valid, false otherwise.
   * @throws {Error} - if the value is not valid.
   */
  validator: (value) => {
    return validator.isNumeric(value.toString())
  },
  message: 'Invalid number value'
}

// Create a schema.
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        /**
         * Validates the name field.
         *
         * @param {string} value - the name to validate.
         * @returns {boolean} - true if the name is valid, false otherwise.
         * @throws {Error} - if the name is not valid.
         */
        validator: (value) => {
          return validator.isLength(value, { min: 1, max: 255 })
        },
        message: 'Name must be between 1 and 255 characters'
      }
    },
    brand: {
      type: String,
      trim: true
    },
    ean: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        /**
         * Validates the ean field.
         *
         * @param {string} value - the ean to validate.
         * @returns {boolean} - true if the value is valid, false otherwise.
         * @throws {Error} - if the value is not valid.
         */
        validator: (value) => {
          return validator.isEAN(value)
        },
        message: 'Invalid EAN code'
      }
    },
    category: {
      type: [String],
      default: []
    },
    image: {
      sm: {
        url: {
          type: String,
          trim: true,
          required: true,
          validate: urlValidator
        },
        alt: {
          type: String,
          trim: true,
          required: true
        }
      },
      lg: {
        url: {
          type: String,
          trim: true,
          required: true,
          validate: urlValidator
        },
        alt: {
          type: String,
          trim: true,
          required: true
        }
      }
    },
    kcal_100g: {
      type: Number,
      required: true,
      validate: nrValidator
    },
    macros_100g: {
      fat: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      saturatedFat: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      carbohydrates: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      sugars: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      protein: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      salt: {
        type: Number,
        required: true,
        validate: nrValidator
      },
      fiber: {
        type: Number,
        required: true,
        validate: nrValidator
      }
    }
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false
  }
)

/**
 * Returns a paginated list of food items with their ean code, name and brand, sorted in alphabetical order by name.
 *
 * @param {number} page - is the page number to return.
 * @param {number} limit - is the number of items to return per page.
 * @param {object} query - is an optional query object to filter the results.
 * @returns {Promise<object[]>} -a list of food items, total number of items, page number, page size, from and to numbers.
 */
schema.statics.listItems = async function (page, limit, query = {}) {
  const skip = (page - 1) * limit
  const [foodItems, total] = await Promise.all([
    this
      .find(query, 'ean name brand')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ])

  return {
    foodItems,
    total,
    page,
    pageSize: foodItems.length,
    from: skip + 1,
    to: skip + foodItems.length
  }
}

/**
 * Returns a paginated list of food items with their ean code, name and brand, sorted in alphabetical order by name.
 * The list is filtered by the query.
 *
 * @param {number} page - is the page number to return.
 * @param {number} limit - is the number of items to return per page.
 * @param {string} query - is the query string to search for.
 * @returns {Promise<object[]>} - a list of food items that matched the search query.
 */
schema.statics.searchItems = async function (page, limit, query) {
  const regex = new RegExp(query, 'i')

  const foodItems = await this
    .listItems(page, limit, {
      $or: [
        { name: regex },
        { brand: regex }
      ]
    })

  return foodItems
}

// Create a model using the schema.
export const FoodItemModel = mongoose.model('FoodItem', schema)
