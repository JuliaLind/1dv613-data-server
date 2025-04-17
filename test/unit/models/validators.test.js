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

  it('eanValidator, should call on the isEAN method of validator node module, should return same result as the validator method', async function () {
    sinon.stub(validator, 'isEAN').returns(false)
    const ean = 'someEanCode'
    const res = eanValidator.validator(ean)
    expect(validator.isEAN.calledOnce).to.be.true
    expect(validator.isEAN.firstCall.args[0]).to.equal(ean)
    expect(res).to.be.false
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