/* global after beforeEach afterEach */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request

import { app, connection, server } from '../../src/server.js'
import { FoodItemModel } from '../../src/models/FoodItem.js'
import { foods } from './mock-data/foods.js'
import sinon from 'sinon'

const expect = chai.expect
chai.use(chaiHttp) // must have for chai.request

describe('scenario - GET foods/', () => {
  before(async () => {
    // await connection.connect()
    await FoodItemModel.insertMany(foods)
  })
  after(async () => {
    await FoodItemModel.deleteMany()
    await connection.disconnect()
    await server.close()
  })

  it('should return 200 for food route and return first 7 food items', async () => {
    const res = await chai.request(app)
      .get('/api/v1/foods')

    expect(res).to.have.status(200)

    const foodItems = res.body.foodItems
    expect(foodItems).to.be.an('array')
    expect(foodItems).to.have.lengthOf(7)
    expect(foodItems[0]).to.deep.equal({
      name: 'Balsamvinäger Vit',
      brand: 'Zeta',
      ean: '7350002401095',
      img: {
        sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07350002401095_C1N1_s02'
      },
      kcal_100g: 97,
      macros_100g: {
        fat: 0,
        saturatedFat: 0,
        carbohydrates: 20,
        sugars: 20,
        protein: 0,
        salt: 0.01,
        fiber: 0
      }
    })

    expect(res.body).to.have.property('total', foods.length)
    expect(res.body).to.have.property('page', 1)
    expect(res.body).to.have.property('pageSize', 7)
    expect(res.body).to.have.property('from', 1)
    expect(res.body).to.have.property('to', 7)

    expect(foodItems[6]).to.deep.equal({
      name: 'Jordgubb Smultron Original Yoghurt 2%',
      brand: 'Yoggi',
      ean: '7310865018465',
      img: {
        sm: 'https://assets.axfood.se/image/upload/f_auto,t_100/07310865018465_C1L1_s02'
      },
      kcal_100g: 78,
      macros_100g: {
        fat: 2,
        saturatedFat: 1.3,
        carbohydrates: 11,
        sugars: 10,
        protein: 3.3,
        salt: 0.07,
        fiber: 0
      }
    })
  })
})
