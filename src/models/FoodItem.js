/**
 * Mongoose model FoodItem.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { eanValidator, urlValidator } from './validators.js'
import createError from 'http-errors'

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
    delete ret._id

    return ret
  }
})

// Create a schema.
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255
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
      validate: eanValidator
    },
    category: {
      type: [String],
      default: []
    },
    img: {
      sm: {
        type: String,
        trim: true,
        required: true,
        validate: urlValidator
      },
      lg: {
        type: String,
        trim: true,
        required: true,
        validate: urlValidator
      }
    },
    kcal_100g: {
      type: Number,
      required: true,
      min: [0, 'Kcal cannot be negative']
    },
    macros_100g: {
      fat: {
        type: Number,
        required: true,
        min: [0, 'Fat cannot be negative']
      },
      saturatedFat: {
        type: Number,
        required: true,
        min: [0, 'Saturated fat cannot be negative']
      },
      carbohydrates: {
        type: Number,
        required: true,
        min: [0, 'Carbohydrates cannot be negative']
      },
      sugars: {
        type: Number,
        required: true,
        min: [0, 'Sugars cannot be negative']
      },
      protein: {
        type: Number,
        required: true,
        min: [0, 'Protein cannot be negative']
      },
      salt: {
        type: Number,
        required: true,
        min: [0, 'Salt cannot be negative']
      },
      fiber: {
        type: Number,
        required: true,
        min: [0, 'Fiber cannot be negative']
      }
    }
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false,
    id: false,
    versionKey: false
  }
)

/**
 * Returns a paginated list of food items with their ean code, name and brand, sorted in alphabetical order by name.
 * The list is filtered by the query.
 *
 * @param {number} page - is the page number to return.
 * @returns {Promise<object[]>} - a list of food items that matched the search query.
 */
schema.statics.searchItems = async function ({ query, page, limit }) {
  const regex = new RegExp(query, 'i')

  const foodItems = await this
    .listItems(
      {
        query: {
          $or: [
            { name: regex },
            { brand: regex }
          ]
        },
        page,
        limit
      }
    )

  return foodItems
}

/**
 * Returns a paginated list of food items with their ean code, name and brand, sorted in alphabetical order by name.
 *
 * @param {number} page - is the page number to return.
 * @returns {Promise<object[]>} -a list of food items, total number of items, page number, page size, from and to numbers.
 */
schema.statics.listItems = async function ({ page = 1, limit = 7, query = {} }) {
  page = Number.parseInt(page)
  limit = Number.parseInt(limit)

  const skip = (page - 1) * limit
  const [foodItems, total] = await Promise.all([
    this
      .find(query, 'ean name brand kcal_100g img.sm macros_100g')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ])

  const pageSize = foodItems.length

  const from = pageSize > 0 ? skip + 1 : 0
  const to = pageSize > 0 ? skip + pageSize : 0

  return {
    foodItems,
    total,
    page,
    pageSize,
    from,
    to
  }
}

/**
 * Returns a map with ean code mapped against food items.
 *
 * @param {string[]} eans - a list of EAN codes
 * @returns {Promise<Map<string, object>>} - a map of EAN codes to food items
 */
schema.statics.getByEans = async function (eans) {
  eans = [...new Set(eans)]

  const foodItems = await this.find({ ean: { $in: eans } }, 'ean name brand kcal_100g macros_100g img.sm')
  const foodMap = new Map()

  for (const foodItem of foodItems) {
    foodMap.set(foodItem.ean, foodItem.toObject())
  }

  return foodMap
}

/**
 * Returns a food item by ean code.
 * If the food item is not found, it throws a 404 error.
 *
 * @param {string} ean - ean code of the food item
 * @returns {object} - the mongodb document of the food item
 * @throws {Error} - if the food item is not found
 */
schema.statics.getByEan = async function (ean) {
  const foodItem = await FoodItemModel.findOne({ ean })

  if (!foodItem) {
    throw createError(404)
  }

  return foodItem
}

// Create a model using the schema.
export const FoodItemModel = mongoose.model('FoodItem', schema)
