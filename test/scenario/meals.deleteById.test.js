/* global afterEach beforeEach */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request
import { JwtService } from '../../src/services/JwtService.js'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { subDays, format } from 'date-fns'

import { app } from '../../src/server.js'
import { MealModel } from '../../src/models/Meal.js'

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiHttp) // must have for chai.request

describe('scenario - DELETE meals/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
  const otherUserId = '234567890123456789012345'
  const selectedDate = format(subDays(new Date(), 5), 'yyyy-MM-dd')
  const lunch = {
    date: selectedDate,
    type: 'lunch',
    foodItems: [
      {
        ean: '5000112637939', // Coca-cola Zero Läsk Burk
        unit: 'g',
        weight: 250
      },
      {
        ean: '7290115203868', // Sojanuggets Fryst
        unit: 'g',
        weight: 100
      },
      {
        ean: '1220000450066', // Bbq Sås Honey Chipotle
        unit: 'g',
        weight: 50
      }
    ]
  }
  let mealId

  beforeEach(async () => {
    await MealModel.deleteMany()
    const firstUserMeal = await MealModel.create({
      ...lunch,
      userId
    })
    mealId = firstUserMeal._id.toString()
  })

  afterEach(async () => {
    await MealModel.deleteMany()
    sinon.restore()
  })

  it('Should be able to delete own meal', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })
    const res = await chai.request(app)
      .delete(`/api/v1/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(res).to.have.status(204)

    const meals = await MealModel.findById(mealId)
    expect(meals).to.be.null
  })

  it('Should not be able to delete meal of another user', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: otherUserId
    })

    const res = await chai.request(app)
      .delete(`/api/v1/meals/${mealId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(res).to.have.status(404) // should not disclose that the meal exists
    const meals = await MealModel.findById(mealId)
    expect(meals).to.not.be.null
  })
})
