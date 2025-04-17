/**
 * Mongoose model Meal.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'

import { FoodItemModel } from './FoodItemModel.js'

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
    ret.id = ret._id.toString()
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
      validate: {
        /**
         * Validates the name field.
         *
         * @param {string} value - the name to validate.
         * @returns {boolean} - true if the value is valid, false otherwise.
         */
        validator: (value) => {
          return validator.isLength(value, { min: 1, max: 255 })
        },
        message: 'Name must be between 1 and 255 characters'
      }
    },
    foodItems: [{
      ean: {
        type: String,
        required: true,
        trim: true,
        validate: {
          /**
           * Validates the EAN field.
           *
           * @param {string} value - the EAN to validate.
           * @returns {boolean} - true if the value is valid, false otherwise.
           */
          validator: (value) => {
            return validator.isEAN(value)
          },
          message: 'Invalid EAN'
        }
      },
      weight: {
        type: Number,
        required: true,
        min: [0, 'Weight must be greater than 0']
      },
      unit: {
        type: String,
        enum: ['g', 'ml'],
        default: 'g',
        required: true
      }
    }]
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false
  }
)

/**
 * Populates the food items in the meal.
 * This function is called after the meal is found.
 *
 * @param {object} doc - mongoose meal document
 */
async function populateOne (doc) {
  const eans = doc.foodItems.map(item => item.ean)
  const foodMap = await getFoodItems(eans)
  doc.setFoodItems(foodMap)
}

/**
 * Populates each meal with food items.
 * This function is called after the meals are found.
 *
 * @param {object[]} docs - an array of mongoose meal documents
 */
async function populateMany (docs) {
  const eans = docs.flatMap(meal => meal.foodItems.map(item => item.ean))
  const foodMap = await getFoodItems(eans)
  for (const doc of docs) {
    doc.setFoodItems(foodMap)
  }
}

/**
 * Returns a mpa with ean code mapped against food items.
 *
 * @param {string[]} eans - a list of EAN codes
 * @returns {Promise<Map<string, object>>} - a map of EAN codes to food items
 */
async function getFoodItems (eans) {
  eans = [...new Set(eans)]
  const foodItems = await FoodItemModel.find({ ean: { $in: eans } })
  const foodMap = new Map()
  for (const foodItem of foodItems) {
    foodMap.set(foodItem.ean, foodItem.toObject())
  }
  return foodMap
}

/**
 * Sets the food items in the meal.
 *
 * @param {Map<string,object>} foodMap - a map of EAN codes to food items
 */
schema.methods.setFoodItems = function (foodMap) {
  this.foodItems = this.foodItems.map(item => ({
    ...item.toObject(),
    data: foodMap.get(item.ean) || null
  }))
}

schema.post('findOne', populateOne)
schema.post('findById', populateOne)
schema.post('find', populateMany)

// Create a model using the schema.
export const MealModel = mongoose.model('Meal', schema)
