/* global after afterEach beforeEach */

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

describe('scenario - PUT user/', () => {
  const token = 'dummytoken'
  const userId = '123456789012345678901234'
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
  })

  afterEach(async () => {
    await UserModel.deleteMany()
    sinon.restore()
  })

  after(async () => {
    await connection.disconnect()
    await server.close()
  })

  it('Req 1.5.6 - should save user history when updating profile', async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })
    let user = (await UserModel.findOne({ userId })).toObject()
    // first history entry should be created
    expect(user.history).to.have.lengthOf(1)
    expect(user.history[0].currentWeight).to.equal(60)
    expect(user.history[0].effectiveDate).to.equal(day1)
    expect(user.history[0].age).to.equal(36)
    expect(user.history[0].height).to.equal(163)
    expect(Object.keys(user.history[0])).to.have.lengthOf(4)

    const day2 = format(subDays(new Date(), 4), 'yyyy-MM-dd')
    const updatedData = {
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: day2,
      age: 36
    }

    // update user
    const res = await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)

    expect(res).to.have.status(204)

    user = (await UserModel.findOne({ userId })).toObject()

    // second history entry should be created
    expect(user.history).to.have.lengthOf(2)

    // latest history entry should be the first in the array
    expect(user.history[0].currentWeight).to.equal(58)

    // update user data second time
    const day3 = format(subDays(new Date(), 3), 'yyyy-MM-dd')
    await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...updatedData,
        effectiveDate: day3,
        currentWeight: 55
      })

    user = (await UserModel.findOne({ userId })).toObject()
    // third history entry should be created
    expect(user.history).to.have.lengthOf(3)
    expect(user.history[0].currentWeight).to.equal(55)
  })

  it('Should not update data belonging to other user', async () => {
    const otherUserId = 'otherUserId'

    sinon.stub(JwtService, 'decodeUser').resolves({
      id: otherUserId
    })

    const newDate = format(new Date(), 'yyyy-MM-dd')
    const updatedData = {
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: newDate,
      age: 36
    }

    const res = await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)

    expect(res).to.have.status(404) // should not disclose that the other user exists

    const otherUser = await UserModel.findOne({ userId: otherUserId })
    expect(otherUser).to.equal(null) // other user should not exist
    const user = await UserModel.findOne({ userId })

    // should remain unchanged
    expect(user.toObject()).to.deep.equal({
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

  const data = {
    gender: 'f',
    currentWeight: 58,
    targetWeight: 53,
    height: 163,
    weeklyChange: 0.5,
    activityLevel: 'light',
    effectiveDate: '2025-06-01',
    age: 36
  }
  const requiredFields = ['currentWeight', 'height', 'age'] // all fields should technically be present in
  // the put request, but these are the only ones that are required for the update to go through

  requiredFields.forEach((field) => {
    it(`Bad Request - should not update user data without ${field}`, async () => {
      const initialUser = await UserModel.findOne({ userId })
      sinon.stub(JwtService, 'decodeUser').resolves({
        id: userId
      })

      const updatedData = { ...data }
      delete updatedData[field]

      const res = await chai.request(app)
        .put('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
      expect(res).to.have.status(400)

      const user = await UserModel.findOne({ userId })
      // should remain unchanged
      expect(user).to.deep.equal(initialUser)
    })
  })

  it('Bad Request - should not update user data prior to latest effectiveDate', async () => {
    const initialUser = await UserModel.findOne({ userId })
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })

    const updatedData = {
      ...data,
      effectiveDate: '2025-02-01'
    }

    const res = await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)
    expect(res).to.have.status(400)

    const user = await UserModel.findOne({ userId })
    // should remain unchanged
    expect(user).to.deep.equal(initialUser)
  })
})
