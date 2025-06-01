/* global afterEach */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request
import { JwtService } from '../../src/services/JwtService.js'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import { app } from '../../src/server.js'
import { FoodItemModel } from '../../src/models/FoodItem.js'

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiHttp) // must have for chai.request

describe('scenario - POST foods/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
  const foodItem = {
    name: 'Dummy Food',
    ean: '1234567890123',
    img: {
      sm: 'https://example.com/image.jpg',
      lg: 'https://example.com/image_large.jpg'
    },
    kcal_100g: 100,
    macros_100g: {
      fat: 5,
      saturatedFat: 1,
      carbohydrates: 20,
      sugars: 10,
      protein: 10,
      salt: 0.5,
      fiber: 2
    }
  }

  afterEach(async () => {
    const doc = await FoodItemModel.findOne({ ean: foodItem.ean })
    if (doc) {
      await doc.deleteOne()
    }
    sinon.restore()
    sinon.reset()
  })

  it('Create a new food item, OK', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    const res = await chai.request(app)
      .post('/api/v1/foods')
      .set('Authorization', `Bearer ${token}`)
      .send(foodItem)

    expect(res).to.have.status(201)
    expect(res.body).to.have.property('name', foodItem.name)
    expect(res.body).to.have.property('ean', foodItem.ean)
    expect(res.body).to.have.property('kcal_100g', foodItem.kcal_100g)
    expect(res.body).to.have.property('macros_100g')
    expect(res.body.macros_100g).to.deep.equal(foodItem.macros_100g)
    expect(res.body).to.not.have.property('createdBy', userId)

    const doc = await FoodItemModel.findOne({
      ean: foodItem.ean
    })
    expect(doc.createdBy).to.equal(userId)
  })

  it('Create a new duplicate food item, not OK', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    let res = await chai.request(app)
      .post('/api/v1/foods')
      .set('Authorization', `Bearer ${token}`)
      .send(foodItem)

    expect(res).to.have.status(201)

    // duplicate request should not go through
    res = await chai.request(app)
      .post('/api/v1/foods')
      .set('Authorization', `Bearer ${token}`)
      .send(foodItem)

    expect(res).to.have.status(409)

    const docs = await FoodItemModel.find({
      ean: foodItem.ean
    })
    expect(docs).to.have.lengthOf(1)
  })
})
