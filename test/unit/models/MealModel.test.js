/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import { MealModel } from '../../../src/models/MealModel.js'


chai.use(chaiAsPromised)
const expect = chai.expect

describe('MealModel', () => {
  afterEach(() => {
    sinon.restore()
  })


  it('getByDate, should search for meals by date and userid', async function () {
    const date = '2023-10-01'
    const type = 'breakfast'
    const meal = {
      type: 'breakfast',
      toObject: sinon.stub().returns({
        id: 'someid',
        date,
        type,
        foodItems: [{
          ean: '1234567890123',
          weight: 100,
          unit: 'g'
        }]
      })
    }
    const userId = 'someUserId'

    sinon.stub(MealModel, 'find').resolves([meal])
    const mealMap = await MealModel.getByDate(date, userId)
    expect(MealModel.find.calledOnce).to.be.true
    expect(MealModel.find.firstCall.args[0]).to.deep.equal({ date, userId })

    expect(mealMap).to.be.an.instanceOf(Map)
    expect(mealMap.size).to.equal(1)
    expect(mealMap.get(type)).to.be.deep.equal(meal.toObject())
  }
  )

})
