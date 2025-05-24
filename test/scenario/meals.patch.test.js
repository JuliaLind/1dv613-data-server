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

describe('scenario - POST user/', () => {
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
  let firstUserMealId

  beforeEach(async () => {
    await MealModel.deleteMany()
    const firstUserMeal = await MealModel.create({
      ...lunch,
      userId
    })
    firstUserMealId = firstUserMeal._id.toString()
  })

  afterEach(async () => {
    await MealModel.deleteMany()
    sinon.restore()
  })

  describe('Modifying meal of one user should not affect another user', () => {
    let mealId

    beforeEach(() => {
      sinon.stub(JwtService, 'decodeUser').resolves({
        id: otherUserId
      })
    })
    afterEach(() => {
      sinon.restore()
    })

    beforeEach(async () => {
      const otherLunch = await MealModel.create({
        ...lunch,
        userId: otherUserId
      })

      mealId = otherLunch._id.toString()
    })
    afterEach(() => {
      MealModel.deleteOne({ _id: mealId })
    })

    it('Add new item to meal', async () => {
      const newItem = {
        ean: '7310240071870', // Mexicana X-tra Allt Pizza Fryst
        unit: 'g',
        weight: 150
      }

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${mealId}/add`)
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)

      expect(res).to.have.status(201)

      const firstUserMeal = await MealModel.findOne({
        userId,
        date: selectedDate,
        type: 'lunch'
      })
      const secondUserMeal = await MealModel.findOne({
        userId: otherUserId,
        date: selectedDate,
        type: 'lunch'
      })
      expect(firstUserMeal.foodItems).to.have.lengthOf(3)
      expect(secondUserMeal.foodItems).to.have.lengthOf(4)
      expect(secondUserMeal.foodItems[3].ean).to.equal(newItem.ean)
      expect(secondUserMeal.foodItems[3].weight).to.equal(newItem.weight)
    })

    it('Remove item from meal', async () => {
      const meal = await MealModel.findById(mealId)
      const itemToRemove = meal.foodItems[1]
      const itemId = itemToRemove._id.toString()

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${mealId}/del/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send()

      expect(res).to.have.status(204)

      const firstUserMeal = await MealModel.findOne({
        userId,
        date: selectedDate,
        type: 'lunch'
      })
      const secondUserMeal = await MealModel.findOne({
        userId: otherUserId,
        date: selectedDate,
        type: 'lunch'
      })
      expect(firstUserMeal.foodItems).to.have.lengthOf(3)
      expect(secondUserMeal.foodItems).to.have.lengthOf(2)
      expect(Array.from(secondUserMeal.foodItems).some((item) => item._id.toString() === itemId)).to.be.false
    })

    it('Change weight of item in meal', async () => {
      const meal = await MealModel.findById(mealId)
      const itemToChange = meal.foodItems[1]
      const itemId = itemToChange._id.toString()
      const newWeight = 2000

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${mealId}/upd`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: itemId,
          weight: newWeight,
          unit: itemToChange.unit
        })

      expect(res).to.have.status(204)

      const firstUserMeal = await MealModel.findOne({
        userId,
        date: selectedDate,
        type: 'lunch'
      })
      const secondUserMeal = await MealModel.findOne({
        userId: otherUserId,
        date: selectedDate,
        type: 'lunch'
      })
      expect(firstUserMeal.foodItems).to.have.lengthOf(3)
      expect(secondUserMeal.foodItems).to.have.lengthOf(3)
      expect(secondUserMeal.foodItems[1].weight).to.equal(newWeight)
      expect(firstUserMeal.foodItems[1].weight).to.equal(lunch.foodItems[1].weight) // first user's meal should not be affected
    })
  })

  describe('Should not be able to modify meal of another user', () => {
    beforeEach(() => {
      sinon.stub(JwtService, 'decodeUser').resolves({
        id: otherUserId
      })
    })

    afterEach(() => {
      sinon.restore()
    })

    it('Add new item to meal', async () => {
      const newItem = {
        ean: '7310240071870', // Mexicana X-tra Allt Pizza Fryst
        unit: 'g',
        weight: 150
      }

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${firstUserMealId}/add`)
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)

      expect(res).to.have.status(404) // Should not disclose that the meal exists

      const firstUserMeal = await MealModel.findById(firstUserMealId)
      expect(firstUserMeal.foodItems).to.have.lengthOf(3) // should not be modified
    })

    it('Remove item from meal', async () => {
      const meal = await MealModel.findById(firstUserMealId)
      const itemToRemove = meal.foodItems[1]
      const itemId = itemToRemove._id.toString()

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${firstUserMealId}/del/${itemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send()

      expect(res).to.have.status(404) // Should not disclose that the meal exists

      const firstUserMeal = await MealModel.findById(firstUserMealId)
      expect(firstUserMeal.foodItems).to.have.lengthOf(3) // should not be modified
    })

    it('Change weight of item in meal', async () => {
      const meal = await MealModel.findById(firstUserMealId)
      const itemToChange = meal.foodItems[1]
      const itemId = itemToChange._id.toString()
      const newWeight = 2000

      const res = await chai.request(app)
        .patch(`/api/v1/meals/${firstUserMealId}/upd`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          id: itemId,
          weight: newWeight,
          unit: itemToChange.unit
        })

      expect(res).to.have.status(404) // Should not disclose that the meal exists

      const firstUserMeal = await MealModel.findById(firstUserMealId)
      expect(firstUserMeal.foodItems[1].weight).to.not.equal(newWeight) // should not be modified
    })
  })
})
