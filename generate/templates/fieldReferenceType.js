var os = require('os');

/**
 * @ref : {ref}
 */
var objectId = {
    name: '{' + os.EOL +
    '\t \ttype: Schema.Types.ObjectId,' + os.EOL +
    '\t \tref: \'{ref}\'' + os.EOL +
    '\t}'
};

module.exports = objectId;
