/**
 * Mongoose model Meal.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'

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

    return ret
  }
})

// Create a schema.
const schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 1,
      message: 'User ID is required'
    },
    currentWeight: {
      type: Number,
      required: true,
      min: 1,
      message: 'Weight must be a positive number'
    },
    targetWeight: {
      type: Number,
      required: true,
      min: 40,
      message: 'Target weight may not be below 40 kg'
    },
    height: {
      type: Number,
      required: true,
      min: 1,
      message: 'Height must be a positive number'
    },
    weeklyChange: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      message: 'Weekly change must be between 0 and 1 kg'
    },
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false
  }
)


// Create a model using the schema.
export const MealModel = mongoose.model('User', schema)
