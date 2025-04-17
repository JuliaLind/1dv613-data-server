/**
 * Mongoose model Meal.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { format } from 'date-fns'

import { FoodItemModel } from './FoodItemModel.js'
import { eanValidator, dateValidator } from './validators.js'

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
      type: Date,
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
 * Gets a meal by userId and date.
 *
 * @param {string|Date} date - is the date to search for
 * @param {string} userId - is the userId to search for
 * @returns {Promise<Map<string,object>>} - a map of meal types to meal objects
 */
schema.statics.getByDate = async function (date, userId) {
  const docs = await this.find({ date, userId })
  const mealMap = new Map()
  for (const doc of docs) {
    mealMap.set(doc.type, doc)
  }
  return mealMap
}

/**
 * Populates the food items in the meal.
 * This function is called after the meal is found.
 *
 * @param {object} doc - mongoose meal document
 */
async function populateOne (doc) {
  const eans = doc.foodItems.map(item => item.ean)
  const foodMap = await FoodItemModel.getByEans(eans)
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
  this.foodItems = this.foodItems.map(item => ({
    ...item.toObject(),
    data: foodMap.get(item.ean) || null
  }))
}

schema.post('findOne', populateOne)
schema.post('findById', populateOne)
schema.post('find', populateMany)

/**
 * Set time to midnight from the date field to ensure the unique index works.
 */
schema.pre('save', function (next) {
  if (this.isModified('date')) {
    this.date.setHours(0, 0, 0, 0)
  }
  next()
})

/**
 * The combination userId - date - mealtype must be unique.
 */
schema.index({ date: 1, userId: 1, type: 1 }, { unique: true })

// Create a model using the schema.
export const MealModel = mongoose.model('Meal', schema)
