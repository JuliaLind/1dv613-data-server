/**
 * Mongoose model FoodItem.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose from 'mongoose'

import createError from 'http-errors'
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

// Create a schema.
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => {
          return validator.isLength(value, { min: 1, max: 255 })
        },
        message: 'Name must be between 1 and 255 characters'
      }
    },
    brand: {
      type: String,
      trim: true,
    },
    ean: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      validate: {
        validator: (value) => {
          return validator.isEAN(value)
        },
        message: 'Invalid EAN code'
      }
    },
    category: {
      type: [String],
      default: [],
    },
    image: {
      sm: {
        url: {
          type: String,
          trim: true,
          required: true,
          validate: {
            validator: (value) => {
              return validator.isURL(value)
            },
            message: 'Invalid thumbnail URL'
          }
        },
        alt: {
          type: String,
          trim: true,
          required: true,
        }
      },
      lg: {
        url: {
          type: String,
          trim: true,
          required: true,
          validate: {
            validator: (value) => {
              return validator.isURL(value)
            },
            message: 'Invalid image URL'
          }
        },
        alt: {
          type: String,
          trim: true,
          required: true,
        }
      }
    },
    kcal_100_g: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => {
          return validator.isNumeric(value.toString())
        },
        message: 'Invalid kcal value'
      }
    },
    macros_100_g: {
      fat: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid fat value'
        }
      },
      saturatedFat: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid saturated fat value'
        }
      },
      carbohydrates: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid carbohydrates value'
        }
      },
      sugars: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid sugars value'
        }
      },
      protein: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid protein value'
        }
      },
      salt: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid salt value'
        }
      },
      fiber: {
        type: Number,
        required: true,
        validate: {
          validator: (value) => {
            return validator.isNumeric(value.toString())
          },
          message: 'Invalid fiber value'
        }
      }
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
export const FoodItemModel = mongoose.model('FoodItem', schema)

