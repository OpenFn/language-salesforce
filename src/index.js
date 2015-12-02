var path = require('path');
var fs = require('fs');

var LanguageSalesforce = {
  template: function() {

    var templatesPath = path.
      join(path.dirname(fs.realpathSync(__filename)), "../templates");

    return fs.readFileSync(templatesPath + "/salesforce.hbs.js", 'utf8');
  },
  adaptors: {
    default: require('./adaptor')
  }
};

module.exports = LanguageSalesforce;
