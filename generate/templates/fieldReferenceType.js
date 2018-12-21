var os = require('os');
/**
 * @ref : {ref}
 */

var objectId = {
    name: '{' + os.EOL +
    '\t\t\ttype: Schema.Types.ObjectId,' + os.EOL +
    '\t\t\tref: \'{ref}\'' + os.EOL +
    '\t\t}'
};

module.exports = objectId;
