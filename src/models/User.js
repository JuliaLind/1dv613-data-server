/**
 * Mongoose model User.
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
      minlength: 1,
      message: 'User ID is required'
    },
    gender: {
      type: String,
      required: true,
      enum: ['m', 'f'],
      message: 'gender is required'
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
      message: 'Weekly change is required',
      min: 0
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'light', 'moderate', 'heavy', 'athlete'],
      message: 'Activity level is required'
    }
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false
  }
)

// Create a model using the schema.
export const UserModel = mongoose.model('User', schema)
