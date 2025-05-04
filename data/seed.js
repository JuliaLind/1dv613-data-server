db = db.getSiblingDB('data') // choose the database

const json = cat('./data/clean.json') // must be relative to working dir, not relative to current dir
const docs = JSON.parse(json)

db.fooditems.drop()
db.fooditems.insertMany(docs)
