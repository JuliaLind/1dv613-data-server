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

describe('scenario - PUT user/', () => {
  const userId = '123456789012345678901234'
  before(async () => {
    sinon.stub(JwtService, 'decodeUser').resolves({
      id: userId
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  after(async () => {
    await connection.disconnect()
    await server.close()
  })

  it('Req 1.5.6 - should save user history when updating profile', async () => {
    const token = 'dummytoken'
    const userData = {
      gender: 'f',
      currentWeight: 60,
      targetWeight: 55.5,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      age: 36
    }

    // create new user
    let res = await chai.request(app)
      .post('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(userData)

    let user = await UserModel.findOne({ userId })
    // first history entry should be created
    expect(user.history).to.have.lengthOf(1)
    expect(user.history[0].currentWeight).to.equal(60)
    expect(user.history[0].effectiveDate).to.equal(format(subDays(new Date(), 5), 'yyyy-MM-dd'))
    expect(user.history[0].age).to.equal(36)
    expect(user.history[0].height).to.equal(163)
    expect(Object.keys(user.history[0])).to.have.lengthOf(4)

    const updatedData = {
      gender: 'f',
      currentWeight: 58,
      targetWeight: 53,
      height: 163,
      weeklyChange: 0.5,
      activityLevel: 'light',
      effectiveDate: format(subDays(new Date(), 4), 'yyyy-MM-dd'),
      age: 36
    }

    // update user
    res = await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)

    expect(res).to.have.status(204)

    user = await UserModel.findOne({ userId })

    // second history entry should be created
    expect(user.history).to.have.lengthOf(2)

    // latest history entry should be the first in the array
    expect(user.history[0].currentWeight).to.equal(58)

    // update user data second time
    await chai.request(app)
      .put('/api/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...updatedData,
        effectiveDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        currentWeight: 55
      })

    user = await UserModel.findOne({ userId })
    // third history entry should be created
    expect(user.history).to.have.lengthOf(3)
    expect(user.history[0].currentWeight).to.equal(55)

    await UserModel.deleteMany()
  })
})
