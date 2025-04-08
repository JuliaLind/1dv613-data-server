import fs from 'fs/promises'

const baseUrl = 'https://dataportal.livsmedelsverket.se/livsmedel/api/v1'
const filename = 'livsmedelsverket-foods.jsonl'
const paus = 1000
const itemsPerReq = 100

const exclGroup = [
  'Lever, njure, tunga etc.',
  'Rätter'
]

const exclKeyword = [
  'späck', 'gris', 'fläsk', 'bacon', 'blandfärs', 'korv', 'blod'
]

/**
 * Adds a paus to avoid rate limiting.
 *
 * @param {number} ms - paus in milliseconds
 * @returns {Promise<void>}
 */
function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Checks if the food item should be excluded from the list
 * bu checking for certain food groups and keywords in item name.
 *
 * @param {object} food - the food item to check
 * @returns {boolean} - true if the item should be excluded
 */
function shouldSkip (food) {
  const name = food.namn?.toLowerCase() || ''
  return (
    exclGroup.includes(food.livsmedelsgrupp) ||
    exclKeyword.some(keyword => name.includes(keyword))
  )
}

/**
 * Gets the initial ist of food items from the
 * Livsmedelsverket api.
 *
 * @param {number} offset - the offset for pagination
 * @param {number} limit - the number of items to fetch
 * @returns {Promise<Array>} - the list of food items
 */
async function fetchFoodList (offset = 0, limit = itemsPerReq) {
  const url = `${baseUrl}/livsmedel?offset=${offset}&limit=${limit}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`fetchFoodList failed with status code ${response.status}`)
  }

  const data = await response.json()
  return data.livsmedel || []
}

/**
 * Fetches the nutrition data for a specific food item.
 *
 * @param {number} num - the id of the food item
 * @returns {Promise<Array>} - a list with nutrition values for the food item
 */
async function fetchNutrition (num) {
  const response = await fetch(`${baseUrl}/livsmedel/${num}/naringsvarden`)
  if (!response.ok) {
    return []
  }
  return await response.json()
}

/**
 * Appends a food item to the json file.
 *
 * @param {object} data - data about a food item
 */
async function appendToFile (data) {
  const line = JSON.stringify(data) + '\n'
  await fs.appendFile(filename, line)
}

/**
 * Combines food item data with nutrition data.
 *
 * @param {object} item - the food item
 * @param {Array} nutrition - array with nutrition values for the food item
 * @returns {object} - combined food item data
 */
function combineFoodData (item, nutrition) {
  return {
    id: item.nummer,
    name: item.namn,
    category: item.livsmedelsgrupp,
    nutrition: filterNutritionData(nutrition)
  }
}

/**
 * Filters the nutrition data to include only relevant fields.
 *
 * @param {Array} nutrition - list of nutrition values
 * @returns {Array} - filtered nutrition values
 */
function filterNutritionData (nutrition) {
  return nutrition.map(n => ({
    name: n.namn,
    shortName: n.fortkortning,
    unit: n.enhet,
    valuePer100g: n.varde / n.viktGram * 100,
    precision: n.precision
  }))
}

/**
 * Fetches all food items from the Livsmedelsverket API
 * and their nutrition data, and writes the data to a jsonl file.
 */
async function fetchAllFoods () {
  let offset = 0

  // Clear the file
  await fs.writeFile(filename, '')

  while (true) {
    const foods = await fetchFoodList(offset)

    if (foods.length === 0) {
      break
    }

    for (const item of foods) {
      if (shouldSkip(item)) {
        console.info(`Exclude item: ${item.namn}`)
        continue
      }

      const nutrition = await fetchNutrition(item.nummer)

      const foodData = combineFoodData(item, nutrition)

      await appendToFile(foodData)
      await delay(paus)
    }

    offset += itemsPerReq
  }
}

try {
  await fetchAllFoods()
} catch (err) {
  console.error(err.message)
}
