/**
 * Mongoose model User.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'

const historyEntrySchema = new mongoose.Schema(
  {
    effectiveDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    currentWeight: {
      type: Number,
      required: true,
      min: 1,
      message: 'Weight must be a positive number'
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      message: 'Age must be a positive number'
    },
    height: {
      type: Number,
      required: true,
      min: 1,
      message: 'Height must be a positive number'
    }
  },
  { _id: false } // optional, disables _id for subdocuments
)

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
    delete ret.id

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
      min: 0.25
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'light', 'moderate', 'heavy', 'athlete'],
      message: 'Activity level is required'
    },
    history: {
      type: [historyEntrySchema],
      default: []
    }
  },
  {
    timestamps: true,
    toObject: convertOptions,
    toJSON: convertOptions,
    optimisticConcurrency: false,
    versionKey: false
  }
)

// Create a model using the schema.
export const UserModel = mongoose.model('User', schema)
