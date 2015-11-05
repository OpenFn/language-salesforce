var sweet = require('sweet.js');
// load all exported macros in `macros/str.sjs`
sweet.loadMacro('./macros/salesforce');
// test.sjs uses macros that have been defined and exported in `macros/str.sjs`
require('./macros_test.sjs');
