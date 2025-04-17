/**
 * Mongoose model FoodItem.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { eanValidator, urlValidator } from './validators.js'

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
 * Returns a map with ean code mapped against food items.
 *
 * @param {string[]} eans - a list of EAN codes
 * @returns {Promise<Map<string, object>>} - a map of EAN codes to food items
 */
schema.statics.getByEans = async function (eans) {
  eans = [...new Set(eans)]
  const foodItems = await this.find({ ean: { $in: eans } }, 'ean name brand kcal_100g')
  const foodMap = new Map()
  for (const foodItem of foodItems) {
    foodMap.set(foodItem.ean, foodItem.toObject())
  }
  return foodMap
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
