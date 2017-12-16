import { expect } from 'chai';
import { } from 'jasmine'; // For describe(...) and it(...) types

import validators, { validatorT } from '../src/utils/inputValidators';

function isFloatValid(value) {
  return validators.nonNegativeNumber(value).isValid();
}

function isIntegerValid(value) {
  return validators.nonNegativeInteger(value).isValid();
}

describe('Input validators', () => {
  it('Should validate float number input', () => {
    expect(isFloatValid('0.123')).to.equal(true);
    expect(isFloatValid('4')).to.equal(true);
    expect(isFloatValid('-4')).to.equal(false);
    expect(isFloatValid('-0.123')).to.equal(false);
    expect(isFloatValid('0.123.')).to.equal(false);

    expect(validators.nonNegativeNumber('-0.123').getErrorMsg()).to.equal("This should be a non negative positive number");

    expect(validators.nonNegativeNumber('-0.123').getClass()).to.equal("md-input-invalid");
    expect(validators.nonNegativeNumber('4').getClass()).to.equal("");
  })
  it('Should validate integer number input', () => {
    expect(isIntegerValid('0.123')).to.equal(false);
    expect(isIntegerValid('4')).to.equal(true);
    expect(isIntegerValid('-4')).to.equal(false);
    expect(isIntegerValid('-0.123')).to.equal(false);
    expect(isIntegerValid('0.12.3')).to.equal(false);

    expect(validators.nonNegativeInteger('-4').getErrorMsg()).to.equal("This should be a non negative integer number");

    expect(validators.nonNegativeInteger('-4').getClass()).to.equal("md-input-invalid");
    expect(validators.nonNegativeInteger('4').getClass()).to.equal("");
  })
})
