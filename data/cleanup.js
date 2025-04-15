import fs from 'fs/promises'

const willysOriginal = './willys.jsonl'

let lines = (await fs.readFile(willysOriginal, 'utf8')).split('\n').filter(Boolean)
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
  'delikatesschark',
]
const clean = []
const excluded = []

function getNutrients (item) {
  const nutrients = {}

  for (const nutrition of item.nutritionsFactList) {
    switch (nutrition.typeCode) {
      case 'energi':
        if (nutrition.unitCode === 'kilokalori') {
          nutrients.kcal_100g = Number.parseFloat(nutrition.value)
        }
        break
      case 'fett':
        nutrients.fat_100g = Number.parseFloat(nutrition.value)
        break
      case 'varav mättat fett':
        nutrients.saturated_fat_100g = Number.parseFloat(nutrition.value)
        break
      case 'kolhydrat':
        nutrients.carbohydrate_100g = Number.parseFloat(nutrition.value)
        break
      case 'varav sockerarter':
        nutrients.sugar_100g = Number.parseFloat(nutrition.value)
        break
      case 'protein':
        nutrients.protein_100g = Number.parseFloat(nutrition.value)
        break
      case 'salt':
        nutrients.salt_100g = Number.parseFloat(nutrition.value)
        break
      case 'fiber':
        nutrients.fiber_100g = Number.parseFloat(nutrition.value)
        break
    }
  }
}

async function cleanObj(item) {
  const obj = {
    name: item.name,
    brand: item.manufacturer,
    ean: item.ean,
    category: item.category,
    image: {
      sm: {
        url: item.thumbnail.url,
        alt: item.thumbnail.name,
      },
      lg: {
        url: item.image.url,
        alt: item.image.alt,
      },
    },
  }

  if ( item.nutritionsFactList && item.nutritionsFactList.length > 0) {
    obj.nutrients = getNutrients(item)
    await addToArr(obj, clean, excluded)
  } else {
    await exclude(item, excluded, 'does not have a nutritionFactList')
  }
}

for (const item of willys) {
  if (excludeCategory.includes(item.category[0] ||
    item.category[1]) ||
    excludeCategory.includes(item.breadcrumbs[1]?.url)) {
    continue
  }

  await cleanObj(item)
}
const json = JSON.stringify(clean, null, 4)
await fs.writeFile('clean.json', json, 'utf8')

async function exclude(obj, arr, reason) {
  arr.push(obj)
  console.log('item', obj.ean, obj.name, obj.manufacturer, obj.category[0], reason)
  await writeLine('excluded.jsonl', obj)
}

async function writeLine(filename, obj) {
  await fs.appendFile(filename, JSON.stringify(obj) + '\n')
}

async function addToArr(obj, clean, excluded) {
  if (obj.nutrients.kcal_100g) {
    clean.push(obj)
    await writeLine('clean.jsonl', obj)
  } else {
    await exclude(item, excluded, 'does not have a kcal value')
  }
}

