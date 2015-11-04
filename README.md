language-salesforce
===================

Experimental Salesforce Language Pack for OpenFn

Intent
------

Allow communication with Salesforce using a set of Lisp compatible expressions.

Using macros we can create a simplified API, simple enough to generate
code from data.

Macros
------

*See [macros](include/macros.ls)*

`(create "sObject" fields...)`  
```js
{
  action: "create",
  sObject: "sObject",
  fields: { fieldOne: "value", ... }
}
```

`(field "fieldOne" "value")`  
```
{ fieldOne: "value" }
```

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




