/* global afterEach */
/* eslint-disable no-unused-expressions */

import chai from 'chai'
import sinon from 'sinon'
import chaiAsPromised from 'chai-as-promised'
import validator from 'validator'
import { urlValidator, eanValidator } from '../../../src/models/validators.js'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('validators', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('urlValidator', async function () {
    sinon.stub(validator, 'isURL')
    const url = 'myImageUrl'
    urlValidator.validator(url)
    expect(validator.isURL.calledOnce).to.be.true
    expect(validator.isURL.firstCall.args[0]).to.equal(url)
  })

  it('eanValidator', async function () {
    sinon.stub(validator, 'isEAN')
    const ean = 'someEanCode'
    eanValidator.validator(ean)
    expect(validator.isEAN.calledOnce).to.be.true
    expect(validator.isEAN.firstCall.args[0]).to.equal(ean)
  })
})