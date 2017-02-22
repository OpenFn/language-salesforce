language-salesforce [![Build Status](https://travis-ci.org/OpenFn/language-salesforce.svg?branch=master)](https://travis-ci.org/OpenFn/language-salesforce)
===================

Experimental Salesforce Language Pack for OpenFn

Intent
------

Allow communication with Salesforce using a set of Lisp compatible expressions.

Using simple functions we can create a simplified API, simple enough to generate
code from data.

Expressions
-----------

Expressions are a simplified set of function calls. Outlining the operations
needed to be performed.

An uncompiled expression has no knowledge of the internals of the adaptor,
credentials or runtime environment.

It's the responsibility of the build process to provide a wrapper that will
inject the functions in.

For example:

```javascript
steps(
  describe('vera__Test_Event__c'),

  create('vera__Test_Event__c', {
    vera__Test_Event_Name_Unique__c: "hello from jsforce"
  }),

  create('vera__Boat__c', {
    Name: "Catatafish redux!",
    vera__Test_Event__c: reference(0)
  })
)
```

Despite this being valid Javascript, it has no knowledge of runtime
dependencies - such as external libraries, configuration etc.

When compiled, an expression may look something like this:

```js
import { execute, describe, create, upsert, reference, steps } from './src/adaptor';

execute({
  connectionOptions: {
    accessToken: "xxxx"
  },

  credentials: {
    username: 'foo',
    password: 'bar',
    securityToken: "baz"
  }
},
  steps(
  describe('vera__Test_Event__c'),

  create('vera__Test_Event__c', {
    vera__Test_Event_Name_Unique__c: "hello from jsforce"
  }),

  create('vera__Boat__c', {
    Name: "Catatafish redux!",
    vera__Test_Event__c: reference(0)
  })
)

);
```

By using this convention we can maintain a very clean separation of concerns.
And an important extension of that, produce runtimes that can be debugged
and tested with relative ease.


Building an expression
----------------------

Expressions can be transformed into executable scripts using the CLI.

`echo 'field(key,value)' | language-salesforce-build`

The above command returns a compiled and wrapped expression ready for
execution in node.js.

Executing a build
-----------------



API
---

`field("key","value")`
Returns `{ "key": "value" }`

`create(sObject, fields ...)`
Returns `state`

`createIf(logical, sObject, fields ...)`
Returns `state`

`upsert(sObject, externalID, fields ...)`
Returns `state`

`steps( operations ... )`
Returns `Array<Operation>`

`map(<JSONPath>, <Operation>, state)`
Wraps an operation around an iterable.
Each operation receives a scoped version of the data for each of items
found at the given path.

Returns `state`


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
