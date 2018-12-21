/**
 * Module dependencies
 */
var ft = require('./fileTools');
var formatTools = require('./formatTools');
var os = require('os');

/**
 * Generate a Mongoose model
 * @param {string} path
 * @param {string} modelName
 * @param {array} modelFields
 * @param {function} cb
 */
function generateModel(path, modelName, modelFields, cb) {
    var fields = formatTools.getFieldsForModelTemplate(modelFields);

    var model = ft.loadTemplateSync('model.js');
    model = model.replace(/{fields}/, fields);

    ft.createDirIfIsNotDefined(path, 'models', function () {
        ft.writeFile(path + '/models/_' + modelName + '.js', model, null, cb);
    });
}

/**
 * Generate a Express router
 * @param {string} path
 * @param {string} modelName
 * @param {function} cb
 */
function generateController(path, modelName, cb) {
    var 'js' = (ts) ? 'ts' : 'js';
    var router = ft.loadTemplateSync('controller.js');
    router = router.replace(/{serviceName}/g, formatTools.capitalizeFirstLetter(modelName) + 'Service');

    ft.createDirIfIsNotDefined(path, 'routes', function () {

        ft.writeFile(path + '/controllers/' + modelName + '/index.js', router, null, cb);
    });
}

/**
 * Generate Service
 * @param {string} path
 * @param {string} modelName
 * @param {array} modelFields
 * @param {function} cb
 */
function generateService(path, modelName, modelFields, cb) {

    var service = ft.loadTemplateSync('service.js');
    var updateFields = '/*';
    var createFields = os.EOL;

    modelFields.forEach(function (f, index, fields) {
        var field = f.name;
        updateFields += field;
        updateFields += os.EOL + '\t\t\t';
        createFields += '\t\t\t' + field + ' : req.body.' + field;
        createFields += ((fields.length - 1) > index) ? ',' + os.EOL : '';
    });
    updateFields += '*/';

    service = service.replace(/{modelName}/g, '_'+modelName);
    service = service.replace(/{name}/g, modelName);
    service = service.replace(/{serviceName}/g, formatTools.capitalizeFirstLetter(modelName) + 'Service');
    service = service.replace(/{createFields}/g, createFields);
    service = service.replace(/{updateFields}/g, updateFields);


    ft.createDirIfIsNotDefined(path, 'services', function () {
        ft.writeFile(path + '/services/_' + modelName + '.js', service, null, cb);
    });

}

module.exports = {
    generateModel: generateModel,
    generateController: generateController,
    generateService: generateService
};
