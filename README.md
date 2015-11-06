language-salesforce
===================

Experimental Salesforce Language Pack for OpenFn

Intent
------

Allow communication with Salesforce using a set of Lisp compatible expressions.

Using macros we can create a simplified API, simple enough to generate
code from data.

Expressions
-----------

Expressions are a simplified set of function calls. Outlining the operations
needed to be performed.

An uncompiled expression has no knowledge of the internals of the adaptor,
credentials or runtime environment.

It's the responsibility of the build process to expand an expression into
something bigger, and is aware of it's own API.

For example:

```javascript
salesforce(
  upsert("obj","exid",
    field(a,1)
  )
)
```

Despite this being valid Javascript, it has no knowledge of runtime
dependencies - such as external libraries, configuration etc.

When compiled, an expression may look something like this:

```js
import FakeAdaptor from './test/FakeAdaptor';
const expression = (function (adaptor, credentials) {

  return adaptor.execute([function (conn) {
    return conn.sobject('obj').upsert({ a: 1 }, 'exid');
  }]);

});

expression(FakeAdaptor, {username: "username", ...});
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



Macros
------

*See [macros](macros/salesforce.sjs)*

`field("key","value")`  
Returns `{ "key": "value" }`

`upsert(sObject, externalID, fields ...)`  
Returns `function(connection) -> Promise`

`salesforce( operations ... )`  
Returns `function(adaptor,credentials)`

Execution
---------

**TBD**

Basic outline is:

1. Compile Expression  
   Assumes bindings to API calls to Salesforce.
2. Evaluate  
   Using a wrapper which will provide logging, exception handling and
   runtime variables (credentials etc).

Development
-----------

```
$ npm install
```

**Running Tests**

```
$ npm test
```




