/**
 * Mongoose model Meal.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { format } from 'date-fns'
import { FoodItemModel } from './FoodItem.js'
import { eanValidator, dateValidator } from './validators.js'
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
    delete ret.userId
    ret.date = format(ret.date, 'yyyy-MM-dd')

    return ret
  }
})

// Create a schema.
const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      message: 'User ID is required'
    },
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2', 'snack3'],
      required: true
    },
    date: {
      type: String,
      trim: true,
      required: true,
      validate: dateValidator
    },
    foodItems: [{
      ean: {
        type: String,
        required: true,
        trim: true,
        validate: eanValidator
      },
      weight: {
        type: Number,
        required: true,
        min: [0, 'Weight must be greater than 0']
      },
      unit: {
        type: String,
        enum: ['g'], // to allow for more values in the future
        default: 'g',
        required: true
      },

      // Optiona fields that are populated when sent to client
      name: String,
      brand: String,
      kcal_100g: Number,
      macros_100g: {
        fat: Number,
        saturatedFat: Number,
        carbohydrates: Number,
        sugars: Number,
        protein: Number,
        salt: Number,
        fiber: Number
      },
      img: {
        sm: String
      }
    }]
  },
  {
    timestamps: false,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false,
    versionKey: false
  }
)

/**
 * Gets a meal by userId and date.
 *
 * @param {string|Date} date - is the date to search for
 * @param {string} userId - is the userId to search for
 * @returns {Promise<Map<string,object>>} - a map of meal types to meal objects
 */
schema.statics.getByDate = async function (date, userId) {
  const docs = await this.find({ date, userId })

  if (docs.length === 0) {
    throw createError(404, 'No meals found for this date')
  }
  const mealMap = new Map()

  for (const doc of docs) {
    mealMap.set(doc.type, doc.toObject())
  }
  return mealMap
}

/**
 * Populates the food items in the meal.
 * This function is called after the meal is found.
 *
 */
schema.methods.populateFoods = async function () {
  const eans = this.foodItems.map(item => item.ean)
  const foodMap = await FoodItemModel.getByEans(eans)

  this.setFoodItems(foodMap)
}

/**
 * Extracts all eans from the meal documents.
 *
 * @param {object[]} docs - mongoose meal documents
 * @returns {string[]} - an array of ean codes
 */
function getEans (docs) {
  return docs.flatMap(meal => meal.foodItems.map(item => item.ean))
}

/**
 * Populates each meal with food items.
 * This function is called after the meals are found.
 *
 * @param {object[]} docs - an array of mongoose meal documents
 */
schema.statics.populateMany = async function populateMany (docs) {
  const eans = getEans(docs)
  const foodMap = await FoodItemModel.getByEans(eans)

  for (const doc of docs) {
    doc.setFoodItems(foodMap)
  }
}

/**
 * Sets the food items in the meal.
 *
 * @param {Map<string,object>} foodMap - a map of EAN codes to food items
 */
schema.methods.setFoodItems = function (foodMap) {
  const foodItems = []
  for (const item of this.foodItems) {
    const foodItem = foodMap.get(item.ean)

    if (foodItem) {
      foodItems.push({
        ...item.toObject(),
        ...foodItem
      })
    }
  }
  this.foodItems = foodItems
}

schema.post('find', async (docs) => await MealModel.populateMany(docs))

/**
 * The combination userId - date - mealtype must be unique.
 */
schema.index({ date: 1, userId: 1, type: 1 }, { unique: true })

// Create a model using the schema.
export const MealModel = mongoose.model('Meal', schema)
