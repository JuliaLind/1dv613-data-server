/* global afterEach beforeEach */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request
import { JwtService } from '../../src/services/JwtService.js'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import { app } from '../../src/server.js'
import { MealModel } from '../../src/models/Meal.js'

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiHttp) // must have for chai.request

describe('scenario - DELETE meals/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
  const otherUserId = '234567890123456789012345'
  const selectedDate = '2025-01-01'
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

  beforeEach(async () => {
    await MealModel.deleteMany()

    // Create a couple of meals for each user
    await MealModel.create({
      ...lunch,
      userId
    })

    await MealModel.create({
      ...lunch,
      userId: otherUserId
    })

    await MealModel.create({
      ...lunch,
      date: '2025-03-02',
      userId
    })

    await MealModel.create({
      ...lunch,
      date: '2025-03-12',
      userId: otherUserId
    })
  })

  afterEach(async () => {
    await MealModel.deleteMany()
    sinon.restore()
  })

  it('Should delete all meals of the user sending the request, but not of other user', async () => {
    // initially there should be 2 meals for each user
    let firstUserMeals = await MealModel.find({ userId })
    expect(firstUserMeals).to.have.lengthOf(2)

    let secondUserMeals = await MealModel.find({ userId: otherUserId })
    expect(secondUserMeals).to.have.lengthOf(2)

    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    const res = await chai.request(app)
      .delete('/api/v1/meals')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(res).to.have.status(204)

    // after deletion, first user should have no meals,
    // but second user should still have their two meals
    firstUserMeals = await MealModel.find({ userId })
    secondUserMeals = await MealModel.find({ userId: otherUserId })
    expect(firstUserMeals).to.have.lengthOf(0)
    expect(secondUserMeals).to.have.lengthOf(2)
  })
})
