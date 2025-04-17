/**
 * Mongoose model Meal.
 *
 * @author Julia Lind
 * @version 1.0.0
 */

import mongoose, { set } from 'mongoose'

import createError from 'http-errors'
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
        validate: {
          validator: v => validator.isEAN(v),
          message: props => `${props.value} is not a valid EAN`
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
  }
)

async function populateOne(doc) {
  const eans = doc.foodItems.map(item => item.ean)
  const foodMap = await getFoodItems(eans)
  doc.setFoodItems(foodMap)
}

async function populateMany(docs) {
  const eans = docs.flatMap(meal => meal.foodItems.map(item => item.ean))
  const foodMap = await getFoodItems(eans)
  for (const doc of docs) {
    doc.setFoodItems(foodMap)
  }
}

async function getFoodItems(eans) {
  eans = [...new Set(eans)]
  const foodItems = await FoodItemModel.find({ ean: { $in: eans } })
  const foodMap = new Map()
  for (const foodItem of foodItems) {
    foodMap.set(foodItem.ean, foodItem.toObject())
  }
  return foodMap
}

schema.methods.setFoodItems = function (foodMap) {
  this.foodItems = this.foodItems.map(item => ({
    ...item.toObject(),
    data: foodMap.get(item.ean) || null
  }))
}


// Populate after findOne and find
mealSchema.post('findOne', populateOne)
mealSchema.post('findById', populateOne)
mealSchema.post('find', populateMany)


// Create a model using the schema.
export const MealModel = mongoose.model('Meal', schema)

