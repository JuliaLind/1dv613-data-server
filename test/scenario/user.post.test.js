/* global afterEach beforeEach */

import chai from 'chai'
import chaiHttp from 'chai-http' // must have for chai.request
import { JwtService } from '../../src/services/JwtService.js'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { subDays, format } from 'date-fns'

import { app } from '../../src/server.js'
import { UserModel } from '../../src/models/User.js'

const expect = chai.expect
chai.use(sinonChai)
chai.use(chaiHttp) // must have for chai.request

describe('scenario - POST user/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
  const day1 = format(subDays(new Date(), 5), 'yyyy-MM-dd')

  beforeEach(async () => {
    await UserModel.deleteMany()
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
  })

  afterEach(async () => {
    await UserModel.deleteMany()
    sinon.restore()
  })

  it('Should not be able to create two user profiles for same user', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    const newData = {
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: day1,
      age: 36
    }

    const res = await chai.request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(newData)

    expect(res).to.have.status(409)

    const users = await UserModel.find({ userId })
    expect(users).to.have.lengthOf(1)

    const user = users[0].toObject()

    expect(user.history[0].currentWeight).to.equal(60)
  })

  it('Should be able to create a new user profile', async () => {
    const otherUserId = 'otherUserId'

    sinon.stub(JwtService, 'decodeUser').resolves({
      id: otherUserId
    })

    const otherUserData = {
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: day1,
      age: 36
    }

    const res = await chai.request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(otherUserData)
    expect(res).to.have.status(201)

    const users = await UserModel.find()
    expect(users).to.have.lengthOf(2) // should have two users now

    const user1 = users[0]
    const user2 = users[1]

    expect(user1.userId).to.equal(userId)
    expect(user1.currentWeight).to.equal(60)
    expect(user2.userId).to.equal(otherUserId)
    expect(user2.currentWeight).to.equal(58)
  })
})
