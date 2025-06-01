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

describe('scenario - POST meals/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
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

  beforeEach(async () => {
    await MealModel.deleteMany()
    await MealModel.create({
      ...lunch,
      userId
    })
  })

  afterEach(async () => {
    await MealModel.deleteMany()
    sinon.restore()
  })

  it('Should not be able to create second meal of same type on same date for same user', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    const res = await chai.request(app)
      .post('/api/v1/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...lunch
      })

    expect(res).to.have.status(409)

    const meals = await MealModel.find({
      userId,
      date: selectedDate,
      type: 'lunch'
    })
    expect(meals).to.have.lengthOf(1)
  })

  it('Should be able to create meal of same type on same date for different user', async () => {
    const otherUserId = '234567890123456789012345'
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: otherUserId
    })

    const res = await chai.request(app)
      .post('/api/v1/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...lunch
      })

    expect(res).to.have.status(201)

    const meals = await MealModel.find({
      date: selectedDate,
      type: 'lunch'
    })
    expect(meals).to.have.lengthOf(2)
    expect(meals[1].userId).to.equal(otherUserId)
    expect(meals[0].userId).to.equal(userId)
  })
})
