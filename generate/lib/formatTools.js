var os = require('os');

var referenceType = require('../templates/fieldReferenceType');
var allowedFieldsTypes = {
    'string'  : String,
    'number'  : Number,
    'date'    : Date,
    'boolean' : Boolean,
    'array'   : Array,
    'objectId': referenceType
};
var form_type = {
    'text':'string', 
    'textarea':'string', 
    'email':'string', 
    'phone':'string', 
    'address':'string', 
    'number':'number', 
    'date':'date', 
    'select':'boolean', 
    'array':'array', 
    'select_id':'objectId'
}
function getFieldsForModelTemplate(fields) {
    var lg = fields.length - 1;

    var modelFields = '{' + os.EOL;
    fields.forEach(function(field, index, array) {

        modelFields += '\t\t\'' + field.name + '\' : '+ (field.isArray ? '[' : '') + (allowedFieldsTypes[form_type[field.type]]).name + (field.isArray ? ']' : '');
        modelFields += (lg > index) ? ',' + os.EOL : os.EOL;

        if (field.reference) {
            modelFields = modelFields.replace(/{ref}/, field.reference);
        }
    });
    modelFields += '\t}';

    return modelFields;
}

function capitalizeFirstLetter(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function pluralize(word) {
    return word + 's';
}

module.exports = {
    getFieldsForModelTemplate: getFieldsForModelTemplate,
    pluralize: pluralize,
    capitalizeFirstLetter: capitalizeFirstLetter
};
