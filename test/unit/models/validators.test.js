/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import validator from 'validator'
import { urlValidator, eanValidator, dateValidator } from '../../../src/models/validators.js'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('validators', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('urlValidator, should call on the isURL method of validator node module, should return same result as the validator method', async function () {
    sinon.stub(validator, 'isURL').returns(true)
    const url = 'myImageUrl'
    const res = urlValidator.validator(url)
    expect(validator.isURL.calledOnce).to.be.true
    expect(validator.isURL.firstCall.args[0]).to.equal(url)
    expect(res).to.be.true
  })

  const correctLengths = [8, 11, 13]
  correctLengths.forEach((length) => {
    it(`eanValidator, should return true for valid EAN code of length ${length}`, async function () {
      const ean = '4'.repeat(length)
      const res = eanValidator.validator(ean)
      expect(res).to.be.true
    })
  })
  const incorrectLengths = [7, 9, 10, 12, 14]
  incorrectLengths.forEach((length) => {
    it(`eanValidator, should return false for invalid EAN code of length ${length}`, async function () {
      const ean = '4'.repeat(length)
      const res = eanValidator.validator(ean)
      expect(res).to.be.false
    })
  })

  it('dateValidator, should call on the isDate method of validator node module, should return same result as the validator method', async function () {
    sinon.stub(validator, 'isDate').returns(true)
    const date = 'somedate'
    const res = dateValidator.validator(date)
    expect(validator.isDate.calledOnce).to.be.true
    expect(validator.isDate.firstCall.args[0]).to.equal(date)
    expect(res).to.be.true
  })
})
