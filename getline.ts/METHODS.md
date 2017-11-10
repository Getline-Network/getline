Getline.ts
===============


This document describes how the getline.ts interface looks like


**Add New Loan**
------
Method for adding a new loan

**Method Name**

`addNewLoan(owner, description, amount, rate, paybackTimePeriod)`

**Params:**

 * `owner=[string]`
 * `description=[string]`
 * `amount=[number]`
 * `rate=[number]`
 * `paybackTime=[number] // Format: 1468959781804 `

**Get Loan By Id**
------
Should return single loan

**Method**

`getLoanById(id)`

**Params:**

 * `id=[string]`

**Response:**

```javascript
{
  id: '12345',
  amount: '1.23',
  funded: '0.12',
  currenct: 'ETH',
  rate: '0.15',
  laonState: 1
}

```
**Loan State :**

* `0` - INVALID
* `1` - COLLATERAL_COLLECTION
* `2` - FUNDRAISING
* `3` - PAYBACK
* `4` - FINISHED

**Get Loans By Owner**
------
Should return all loans own by the owner

**Method**

`getLoansByOwner(owner)`

**Params:**

 * `owner=[string]`

**Response:**

List of loans described in getLoanById method


 **Get Fundraising Loans**
------
Should return all loans which are in fundraising phase

**Method**

`getFundraisingLoans()`

**Response:**

List of loans described in getLoanById method



