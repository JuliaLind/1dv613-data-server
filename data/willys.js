/**
 * Module from scraping data from willys.se
 *
 * @author Julia Lind <jl225vf@student.lnu.se>
 * @version 1.1.1
 */

import fs from 'fs/promises'
import { JSDOM } from 'jsdom'

import { parseStringPromise } from 'xml2js'

const baseUrl = 'https://www.willys.se/'
const sitemapUrl = baseUrl + 'sitemap.xml'
const apiUrl = baseUrl + 'axfood/rest/p/'

const filename = 'willys.jsonl'
const filename2 = 'willys.json'
const paus = 10_000

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
 * Gets url to the page for a single product, from the sitemap.
 *
 * @returns {Promise<string>} - the url to the product page
 */
async function getProductUrl () {
  const res = await fetch(sitemapUrl)
  const xml = await res.text()
  const parsed = await parseStringPromise(xml)
  const sitemaps = parsed.sitemapindex.sitemap

  for (const entry of sitemaps) {
    const loc = entry.loc?.[0]
    if (loc && loc.includes('Product-en-SEK')) {
      return loc
    }
  }

  throw new Error('Product url not found')
}

/**
 * Fetches a webpage and returns its DOM document content.
 *
 * @param {string} url - url to the webpage to get the DOM document from.
 * @param {object} config - config for the fetch request
 * @returns {Promise<Document>} - The DOM document of the fetched webpage.
 */
export async function fetchDoc (url, config) {
  const res = await fetch(url, config)
  const text = await res.text()
  const document = (new JSDOM(text)).window.document

  return document
}

/**
 * Gets the information about each product
 * for all the products. Appends each product to a file.
 *
 * @param {string} productUrl - the url of the site that contains a list of products
 * @returns {Promise<Array>} - the list of products
 */
async function getProductEntries (productUrl) {
  const res = await fetch(productUrl)
  const xml = await res.text()
  const parsed = await parseStringPromise(xml)

  const urlEntries = parsed.urlset.url
  const result = []

  for (const entry of urlEntries) {
    await delay(paus)
    try {
      const url = entry.loc[0]
      const product = await getSingleProduct(url)
      result.push(product)
    } catch (err) {
      console.error(err.message)
      continue
    }
  }

  return result
}

/**
 * Fetches the product page and extracts the product information.
 *
 * @param {string} url - url to the single product page
 * @returns {Promise<object>} - the product object
 */
async function getSingleProduct (url) {
  const doc = await fetchDoc(url)
  const scriptTag = doc.querySelector('script#__NEXT_DATA__')
  const jsonText = scriptTag?.textContent
  const data = JSON.parse(jsonText)

  const productId = data.props.pageProps.code
  const res = await fetch(`${apiUrl}${productId}`)
  const json = await res.json()

  const {
    breadcrumbs,
    ean,
    image,
    ingredients,
    preparationType,
    servingSize,
    nutrientHeaders,
    googleAnalyticsCategory,
    nutritionsFactList,
    nutrientComponents,
    description,
    price,
    comparePrice,
    comparePriceUnit,
    manufacturer,
    thumbnail,
    name,
    code
  } = json

  const obj = {
    name,
    code,
    ean,
    image: {
      url: image.url,
      alt: image.altText
    },
    category: googleAnalyticsCategory.split('|'),
    breadcrumbs,
    ingredients,
    preparationType,
    servingSize,
    nutrientHeaders,
    nutritionsFactList,
    nutrientComponents,
    description,
    price,
    comparePrice,
    comparePriceUnit,
    manufacturer,
    thumbnail: {
      url: thumbnail.url,
      alt: thumbnail.altText
    }
  }

  console.log(obj)

  const line = JSON.stringify(obj) + '\n'
  await fs.appendFile(filename, line)
  return obj
}

/**
 * Writes down the food objects to a file.
 *
 * @param {string} filename - name of the file to write to
 * @param {Array} arr - array with food objects to be written to the file
 */
async function writeToFile (filename, arr) {
  const json = JSON.stringify(arr, null, 4)
  await fs.writeFile(filename, json, 'utf8')
}

/**
 * The main function that runs the script.
 */
const main = async () => {
  const productUrl = await getProductUrl()
  const products = await getProductEntries(productUrl)
  await writeToFile(filename2, products)
}

await main()
