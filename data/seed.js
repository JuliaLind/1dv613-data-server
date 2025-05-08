import fs from 'fs'

// eslint-disable-next-line
db = db.getSiblingDB('data') // choose the database

const json = fs.readFileSync('./data/clean.json', 'utf8') // must be relative to working dir, not relative to current dir
const docs = JSON.parse(json)

// eslint-disable-next-line
db.fooditems.drop()

// eslint-disable-next-line
db.fooditems.insertMany(docs)
