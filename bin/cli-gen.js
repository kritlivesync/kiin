#!/usr/bin/env node

/**
 * Module dependencies
 */
var program  = require('commander');
var readline = require('readline');
var async    = require('async');
var generators = require('../generate/lib/generators');
var cliStyles = require('../generate/lib/cliStyles');

var pkg = require('../package.json');
var version = pkg.version;

var rl = readline.createInterface({
    input : process.stdin,
    output: process.stdout
});

var ALLOWED_FIELDS_TYPES = ['string', 'number', 'date', 'boolean', 'array', 'objectId'];
var ALLOWED_REST_ARGUMENT = {'YES': 'yes', 'NO': 'no'};
var CLI_PHRASES = {
    AVAILABLE_TYPE: 'Available types : string, number, date, boolean, array, objectId',
    QUESTION_MODEL_NAME: 'Model Name : ',
    QUESTION_FIELD_NAME: 'Field Name (press <return> to stop adding fields) : ',
    QUESTION_FIELD_TYPE: 'Field Type [string] : ',
    QUESTION_FIELD_REF: 'Reference (model name referred by the objectId field) : ',
    QUESTION_GENERATE_REST: 'Generate Rest (yes/no) ? [yes] : ',
    ERROR_MODEL_NAME: 'Argument required : Model name',
    ERROR_TYPE_ARGUMENT: 'Invalid Argument : Field type is not allowed',
    ERROR_REST_ARGUMENT: 'Argument invalid : rest',
    ERROR_FILES_TREE_ARGUMENT: 'Argument invalid : file tree generation',
    ERROR_FIELD_REQUIRED: 'Argument required : fields',
    ERROR_FIELD_NAME_REQUIRED: 'Argument required : Field Name',
    ERROR_FIELD_TYPE_REQUIRED: 'Argument required : Field type',
    ERROR_FIELD_TYPE_INVALID: 'Invalid Argument : Field type is not allowed'
};

// CLI
program
    .version(version)
    .usage('[options]')
    .option('-m, --model <modelName>', 'model name')
    .option('-f, --fields <fields>', 'model fields (name1:type1,name2:type2)')
    .option('-r, --rest', 'enable generation REST')
    .option('-t, --tree <tree>', 'files tree generation grouped by <t>ype or by <m>odule')
    .option('--ts', 'Generating code in TS')
    .parse(process.argv)
;

// Main program
(function (path) {
    if (program.model || program.fields) {
        runNonInteractiveMode(path);
    } else {
        runInteractiveMode(path);
    }
})('.');

/**
 * Get parameters in interactive mode
 * @param {string} path destination path
 */
function runInteractiveMode (path) {
    async.series({
            name: function (cb) {
                askQuestion(CLI_PHRASES.QUESTION_MODEL_NAME, isModelNameParamValid, function (name) {
                    console.log(cliStyles.green + CLI_PHRASES.AVAILABLE_TYPE + cliStyles.reset);
                    cb(null, name);
                });
            },
            fields: function (cb) {
                var exit   = false;
                var fields = [];
                var currentField = {};

                async.whilst(
                    function () { return !exit; },
                    function (cb) {
                        async.series({
                                name: function (cb) {
                                    askQuestion(CLI_PHRASES.QUESTION_FIELD_NAME,
                                        null,
                                        function (fieldName) {
                                            if (fieldName.trim().length === 0) {
                                                exit = true;
                                            }
                                            cb(exit, fieldName);
                                        }
                                    );
                                },
                                type: function (cb) {
                                    askQuestion(CLI_PHRASES.QUESTION_FIELD_TYPE, isFieldTypeParamValid,
                                        function (fieldType) {
                                            currentField.type = (fieldType.trim().length === 0) ? 'string' : fieldType;
                                            cb(null, currentField.type);
                                        }
                                    );
                                },
                                reference: function (cb) {
                                    if (currentField.type === 'objectId') {
                                        askQuestion(CLI_PHRASES.QUESTION_FIELD_REF, null, function (referenceName) {
                                            referenceName = (referenceName.trim().length === 0) ?
                                                'INSERT_YOUR_REFERENCE_NAME_HERE'
                                                : referenceName;
                                            cb(null, referenceName);
                                        });
                                    } else {
                                        cb(null, null);
                                    }
                                }
                            },
                            function (err, results) {
                                if (!err) {
                                    fields.push(results);
                                }
                                cb();
                            });
                    },
                    function (err, results) {
                        cb(null, fields);
                    });
            },
            rest: function (cb) {
                askQuestion(CLI_PHRASES.QUESTION_GENERATE_REST, isRestParamValid, function (rest) {
                    rest = (rest.trim().length === 0) ? 'yes' : rest;
                    cb(null, rest);
                });
            }
        },
        function (err, results) {
            if (err) {
                return closeProgram();
            }

            async.parallel([
                    function (cb) {
                        generators.generateModel(path, results.name, results.fields, cb);
                    },
                    function (cb) {
                        if (results.rest !== 'yes') { return cb(); }
                        generators.generateRouter(path, results.name,  cb);
                    }            ,
                    function (cb) {
                        if (results.rest !== 'yes') { return cb(); }
                        generators.generateController(path, results.name, results.fields, cb);
                    }
                ],
                function (err, results) {
                    closeProgram();
                }
            );
        }
    );
}

/**
 * Get parameters in non-interactive mode
 * @param {string} path destination path
 */
function runNonInteractiveMode(path) {
    if (!isModelNameParamValid(program.model) || !isFieldsParamValid(program.fields)) {
        return closeProgram();
    }

    var modelName = program.model;
    var modelFields = formatFieldsParamInArray(program.fields);

    if (!modelFields) { return closeProgram(); }

    async.parallel([
            function (cb) {
                generators.generateModel(path, modelName, modelFields, cb);
            },
            function (cb) {
                if (!program.rest) { return cb(); }
                generators.generateRouter(path, modelName, cb);
            },
            function (cb) {
                if (!program.rest) { return cb(); }
                generators.generateController(path, modelName, modelFields, cb);
            }
        ],
        function (err, results) {
            closeProgram();
        }
    );
}

/**
 * Ask a question in the console and waits for a response
 * if the answer is invalid, the question is recalled
 * @param {string} question input question in the console
 * @param {function} validate validation function (nullable)
 * @param {function} callback callback function
 */
function askQuestion(question, validate, callback) {
    rl.question(question, function(answer) {
        if (validate) {
            if (!validate(answer)) {
                askQuestion(question, validate, callback);
                return ;
            }
        }
        callback(answer);
    });
}

/**
 * Close the program
 */
function closeProgram() {
    rl.close();
    process.exit();
}

/**
 * Validate model name input
 * @param {string} name
 * @returns {boolean} is validated
 */
function isModelNameParamValid(name) {
    if (!name || name.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_MODEL_NAME);
        return false;
    }
    return true;
}

/**
 * validate field type input
 * @param {string} fieldType
 * @returns {boolean} is validated
 */
function isFieldTypeParamValid(fieldType) {
    if (!fieldType || fieldType.trim().length === 0) { fieldType = ALLOWED_FIELDS_TYPES[0]; } // default value
    if (ALLOWED_FIELDS_TYPES.indexOf(fieldType) === -1) {
        consoleError(CLI_PHRASES.ERROR_TYPE_ARGUMENT);
        return false;
    }
    return true;
}

/**
 * validate rest input
 * @param {string} param
 * @returns {boolean} is validated
 */
function isRestParamValid(param) {
    if (!param || param.trim().length === 0) { param = ALLOWED_REST_ARGUMENT.YES; } // default value
    if (param !== ALLOWED_REST_ARGUMENT.YES && param !== ALLOWED_REST_ARGUMENT.NO) {
        consoleError(CLI_PHRASES.ERROR_REST_ARGUMENT);
        return false;
    }
    return true;
}


/**
 * Validate fields input
 * @param {string} fields
 * @returns {boolean} is validated
 */
function isFieldsParamValid(fields) {
    if (!fields || fields.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_FIELD_REQUIRED);
        return false;
    }
    return true;
}

/**
 * Validate name / type of a field
 * @param {string} fieldName
 * @param {string} fieldType
 * @returns {boolean} is validated
 */
function isFieldValid(fieldName, fieldType) {
    if (!fieldName || fieldName.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_FIELD_NAME_REQUIRED);
        return false;
    }
    if (!fieldType || fieldType.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_FIELD_TYPE_REQUIRED);
        return false;
    }
    if (ALLOWED_FIELDS_TYPES.indexOf(fieldType) === -1) {
        consoleError(CLI_PHRASES.ERROR_FIELD_TYPE_INVALID);
        return false;
    }
    return true;
}

/**
 * Format fields input in array
 * @param {string} fields fields input
 * @returns {Array} fields formatted
 */
function formatFieldsParamInArray(fields) {
    var arrayFields = fields.split(',');
    var result = [];

    var err = arrayFields.every(function (field) {
        var f = field.split(':');

        var fieldName = f[0];
        var fieldType = (f[1] || ALLOWED_FIELDS_TYPES[0]);
        var fieldRef = '';
        var isArray = false;

        if (fieldType === ALLOWED_FIELDS_TYPES[5]) {
            fieldRef = f[2];
            isArray = f[3] === ALLOWED_FIELDS_TYPES[4];
        } else {
            isArray = f[2] === ALLOWED_FIELDS_TYPES[4];
        }

        if (!isFieldValid(fieldName, fieldType)) { return false; }

        result.push({
            name: fieldName,
            type: fieldType,
            isArray: isArray,
            reference: fieldRef
        });

        return true;
    });

    return (!err) ? false : result;
}

function consoleError(msg) {
    return console.log(cliStyles.red + msg + cliStyles.reset);
}
