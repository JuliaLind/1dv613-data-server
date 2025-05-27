import fs from 'fs/promises'

const willysOriginal = './willys.jsonl'
const lines = (await fs.readFile(willysOriginal, 'utf8')).split('\n').filter(Boolean)
const willys = lines.map(line => JSON.parse(line))

const excludeCategory = [
  'apotek',
  'djur',
  'bacon-och-stekflask',
  'chark',
  'korv',
  'kassler',
  'halsa-och-skonhet',
  'hem-och-stad',
  'kiosk',
  'tobak',
  'blommor-och-tradgard',
  'barn',
  'chark',
  'delikatesschark'
]

/**
 * Returns only the relevant data from the nutrition object.
 *
 * @param {object} nutrition - object with nutrition data
 * @returns {object} only the value and the measurementprecisioncode
 */
function getNutritionData (nutrition) {
  return Number.parseFloat(nutrition.value) || 0
}

/**
 * Get the nutrient values from a food item.
 *
 * @param {object} item - associative array with food data
 * @returns {object} - object with nutrient values
 */
function getNutrients (item) {
  let fat
  let saturatedFat
  let carbohydrates
  let sugars
  let protein
  let salt
  let fiber

  for (const nutrition of item.nutritionsFactList) {
    switch (nutrition.typeCode) {
      case 'fett':
        fat = getNutritionData(nutrition)
        break
      case 'varav mättat fett':
        saturatedFat = getNutritionData(nutrition)
        break
      case 'kolhydrat':
        carbohydrates = getNutritionData(nutrition)
        break
      case 'varav sockerarter':
        sugars = getNutritionData(nutrition)
        break
      case 'protein':
        protein = getNutritionData(nutrition)
        break
      case 'salt':
        salt = getNutritionData(nutrition)
        break
      case 'fiber':
        fiber = getNutritionData(nutrition)
        break
    }
  }

  const nutrients = {
    fat: fat || 0,
    saturatedFat: saturatedFat || 0,
    carbohydrates: carbohydrates || 0,
    sugars: sugars || 0,
    protein: protein || 0,
    salt: salt || 0,
    fiber: fiber || 0
  }
  return nutrients
}

/**
 * Selects the relevant data from the food item.
 * Writes object to excluded.jsonl.
 *
 * @param {object} item - associate array with food data
 * @returns {object} - cleaned food item
 */
async function cleanObj (item) {
  const obj = {
    name: item.name,
    brand: item.manufacturer,
    ean: item.ean,
    category: item.category,
    img: {
      sm: item.thumbnail.url,
      lg: item.image.url
    }
  }

  if (item.nutritionsFactList && item.nutritionsFactList.length > 0) {
    obj.kcal_100g = Number.parseFloat(item.nutritionsFactList.find(nutrition => nutrition.typeCode === 'energi' && nutrition.unitCode === 'kilokalori')?.value)
    obj.macros_100g = getNutrients(item)
    return obj
  } else {
    await exclude(item, 'does not have a nutritionFactList')
    return undefined
  }
}

/**
 * Main function to clean the data.
 * Iterates over the food items and saves the cleaned and complete
 * items to array to be saved to foods.json. Excluded items are saved to excluded.jsonl.
 */
async function main () {
  const clean = [] // will contain all the complete items

  for (const item of willys) {
    if (excludeCategory.includes(item.category[0] ||
      item.category[1]) ||
      excludeCategory.includes(item.breadcrumbs[1]?.url)) {
      continue
    }

    const obj = await cleanObj(item)
    if (obj) {
      await addToArr(obj, clean)
    }
  }
  const json = JSON.stringify(clean, null, 4)
  await fs.writeFile('foods.json', json, 'utf8')
}

/**
 * Adds the excluded item to the excluded.jsonl file.
 *
 * @param {object} obj - the food item to be excluded
 * @param {string} reason - the reason for exclusion
 */
async function exclude (obj, reason) {
  console.error('item', obj.ean, obj.name, obj.manufacturer, obj.category[0], reason)
  await writeLine('excluded.jsonl', obj)
}

/**
 * Appends information about a food item to a file.
 *
 * @param {string} filename - name of the file to append the line to.
 * @param {object} obj - associative array with food data to be stringified and appended to file.
 */
async function writeLine (filename, obj) {
  await fs.appendFile(filename, JSON.stringify(obj) + '\n')
}

/**
 * If a food item has a kcal value, it is added to the clean array.
 * Otherwise, it is excluded and the reason is logged.
 *
 * @param {object} obj - the object to be added to the array
 * @param {Array} clean - array with the clean food objects
 */
async function addToArr (obj, clean) {
  if (obj.kcal_100g) {
    clean.push(obj)
  } else {
    await exclude(obj, 'does not have a kcal value')
  }
}

try {
  await main()
} catch (err) {
  console.error(err)
}
