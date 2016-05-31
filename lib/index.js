'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adaptor = exports.FakeAdaptor = undefined;

var _Adaptor = require('./Adaptor');

var Adaptor = _interopRequireWildcard(_Adaptor);

var _FakeAdaptor = require('./FakeAdaptor');

var FakeAdaptor = _interopRequireWildcard(_FakeAdaptor);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = Adaptor;
exports.FakeAdaptor = FakeAdaptor;
exports.Adaptor = Adaptor;
