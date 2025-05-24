/* global after before */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request
import { JwtService } from '../../src/services/JwtService.js'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { subDays, format } from 'date-fns'

import { app, connection, server } from '../../src/server.js'
import { UserModel } from '../../src/models/User.js'

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiHttp) // must have for chai.request

describe('scenario - POST user/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
  const otherUserId = '234567890123456789012345'
  const day1 = format(subDays(new Date(), 5), 'yyyy-MM-dd')


  beforeEach(async () => {
    await UserModel.deleteMany()
    // reset the history array
    await UserModel.create({
      userId,
      gender: 'f',
      currentWeight: 60,
      targetWeight: 55.5,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      history: [
        {
          currentWeight: 60,
          effectiveDate: day1,
          age: 36,
          height: 163
        }
      ]
    })
    await UserModel.create({
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      userId: otherUserId,
      history: [
        {
          currentWeight: 58,
          effectiveDate: day1,
          age: 37,
          height: 163
        }
      ]
    })
  })

  afterEach(async () => {
    await UserModel.deleteMany()
    sinon.restore()
  })

  it('Should only delete the user data for user making the request', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    let users = await UserModel.find()
    expect(users).to.have.lengthOf(2)

    let res = await chai.request(app)
      .delete('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)


    expect(res).to.have.status(204)

    users = await UserModel.find()
    expect(users).to.have.lengthOf(1)
    expect(users[0].userId).to.equal(otherUserId)
  })

  
})
