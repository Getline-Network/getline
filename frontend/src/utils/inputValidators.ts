export interface validatorT {
  isValid: { (): boolean },
  getErrorMsg: { (): string },
  getClass: { (): string }
}

export interface validatorsT {
  nonNegativeNumber: (inputValue: string) => validatorT,
  nonNegativeInteger: (inputValue: string) => validatorT
}

function nonNegativeNumber(value: string): validatorT {
  const pattern = /^\d+(\.\d+)?$/;
  const isValid = pattern.test(value);
  return {
    isValid() {
      return isValid;
    },
    getErrorMsg() {
      return "This should be a non negative positive number";
    },
    getClass() {
      return isValid ? "" : "md-input-invalid";
    }
  }
}

function nonNegativeInteger(value: string): validatorT {
  const pattern = /^\d+$/;
  const isValid = pattern.test(value);
  return {
    isValid() {
      return isValid;
    },
    getErrorMsg: function () {
      return "This should be a non negative integer number";
    },
    getClass() {
      return isValid ? "" : "md-input-invalid";
    }
  }
}

const validators: validatorsT = {
  nonNegativeNumber,
  nonNegativeInteger
}

export default validators;