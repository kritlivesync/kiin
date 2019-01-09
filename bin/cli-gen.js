#!/usr/bin/env node


var program  = require('commander');
var readline = require('readline');
var async    = require('async');
var generators = require('../generate/lib/generators');

var pkg = require('../package.json');
var version = pkg.version;

var rl = readline.createInterface({
    input : process.stdin,
    output: process.stdout
});

var ALLOWED_FIELDS_TYPES = [    'text', 
    'textarea', 
    'email', 
    'phone', 
    'address', 
    'number', 
    'date', 
    'select', 
    'array', 
    'select_id'];
var ALLOWED_REST_ARGUMENT = {'YES': 'yes', 'NO': 'no'};
var CLI_PHRASES = {
    AVAILABLE_TYPE: '\x1b[36mAvailable types :\x1b[0m string, number, date, boolean, array, objectId',
    QUESTION_DATABASE_NAME: '\x1b[36mDatabase Name :\x1b[0m ',
    QUESTION_MODEL_NAME: '\x1b[36mModel Name :\x1b[0m ',
    QUESTION_FIELD_NAME: '\x1b[36mField Name\x1b[0m  (press <return> to stop adding fields) :',
    QUESTION_FIELD_TYPE: '\x1b[36mField Type\x1b[0m [string] : ',
    QUESTION_FIELD_REF: '\x1b[36mReference\x1b[0m  (model name referred by the objectId field eg. _member) :',
    QUESTION_GENERATE_REST: 'Generate Rest (yes/no) ? [yes] : ',
    ERROR_DATABASE_NAME: 'Argument required : Database name',
    ERROR_MODEL_NAME: 'Argument required : Model name',
    ERROR_TYPE_ARGUMENT: 'Invalid Argument : Field type is not allowed',
    ERROR_REST_ARGUMENT: 'Argument invalid : rest',
    ERROR_FIELD_REQUIRED: 'Argument required : fields',
    ERROR_FIELD_NAME_REQUIRED: 'Argument required : Field Name',
    ERROR_FIELD_TYPE_REQUIRED: 'Argument required : Field type',
    ERROR_FIELD_TYPE_INVALID: 'Invalid Argument : Field type is not allowed'
};

program
    .version(version)
    .usage('[options]')
    .option('-d, --database <databaseName>', 'database name')
    .option('-m, --model <modelName>', 'model name')
    .option('-f, --fields <fields>', 'model fields (name1:type1,name2:type2)')
    .option('-r, --rest', 'enable generation REST')
    .option('-h, --help', 'help')
    .parse(process.argv)
;

(function (path) {
    if (program.database || program.model || program.fields) {
        runNonInteractiveMode(path);
    } else if(program.help) {
        runInteractiveMode(path);

    } else {

        console.log('   \x1b[36mGenerate\x1b[0m : ')
        console.log('   kiin-gen -d main -m user -f name,email,group_id:objectId:-user,status:boolean -r')
        closeProgram();        
    }
})('.');


function runInteractiveMode (path) {
    async.series({
            database: function (cb) {
                askQuestion(CLI_PHRASES.QUESTION_DATABASE_NAME, isDatabaseNameParamValid, function (database) {
                    console.log(CLI_PHRASES.AVAILABLE_TYPE);
                    cb(null, database);
                });
            },
            name: function (cb) {
                askQuestion(CLI_PHRASES.QUESTION_MODEL_NAME, isModelNameParamValid, function (name) {
                    console.log(CLI_PHRASES.AVAILABLE_TYPE);
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
                                            currentField.type = (fieldType.trim().length === 0) ? 'text' : fieldType;
                                            cb(null, currentField.type);
                                        }
                                    );
                                },
                                reference: function (cb) {
                                    if (currentField.type === 'select_id') {
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
                        generators.generateModel(path, results.database, results.name, results.fields, cb);
                    },
                    function (cb) {
                        if (results.rest !== 'yes') { return cb(); }
                        generators.generateController(path, results.database, results.name,  cb);
                    }            ,
                    function (cb) {
                        if (results.rest !== 'yes') { return cb(); }
                        generators.generateService(path, results.database, results.name, results.fields, cb);
                    }
                ],
                function (err, results) {
                    closeProgram();
                }
            );
        }
    );
}

function runNonInteractiveMode(path) {
    if (!isDatabaseNameParamValid(program.database) || !isModelNameParamValid(program.model) || !isFieldsParamValid(program.fields)) {
        return closeProgram();
    }
    var databaseName = program.database;
    var modelName = program.model;
    var modelFields = formatFieldsParamInArray(program.fields);

    if (!modelFields) { return closeProgram(); }

    async.parallel([
            function (cb) {
                generators.generateModel(path, databaseName, modelName, modelFields, cb);
            },
            function (cb) {
                if (!program.rest) { return cb(); }
                generators.generateController(path, databaseName, modelName, cb);
            },
            function (cb) {
                if (!program.rest) { return cb(); }
                generators.generateService(path, databaseName, modelName, modelFields, cb);
            }
        ],
        function (err, results) {
            closeProgram();
        }
    );
}

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

function closeProgram() {
    rl.close();
    process.exit();
}

function isDatabaseNameParamValid(name) {
    if (!name || name.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_DATABASE_NAME);
        return false;
    }
    return true;
}

function isModelNameParamValid(name) {
    if (!name || name.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_MODEL_NAME);
        return false;
    }
    return true;
}


function isFieldTypeParamValid(fieldType) {
    if (!fieldType || fieldType.trim().length === 0) { fieldType = ALLOWED_FIELDS_TYPES[0]; }
    if (ALLOWED_FIELDS_TYPES.indexOf(fieldType) === -1) {
        consoleError(CLI_PHRASES.ERROR_TYPE_ARGUMENT);
        return false;
    }
    return true;
}

function isRestParamValid(param) {
    if (!param || param.trim().length === 0) { param = ALLOWED_REST_ARGUMENT.YES; }
    if (param !== ALLOWED_REST_ARGUMENT.YES && param !== ALLOWED_REST_ARGUMENT.NO) {
        consoleError(CLI_PHRASES.ERROR_REST_ARGUMENT);
        return false;
    }
    return true;
}

function isFieldsParamValid(fields) {
    if (!fields || fields.trim().length === 0) {
        consoleError(CLI_PHRASES.ERROR_FIELD_REQUIRED);
        return false;
    }
    return true;
}

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

function formatFieldsParamInArray(fields) {
    var arrayFields = fields.split(',');
    var result = [];

    var err = arrayFields.every(function (field) {
        var f = field.split(':');

        var fieldName = f[0];
        var fieldType = (f[1] || ALLOWED_FIELDS_TYPES[0]);
        var fieldRef = '';
        var isArray = false;

        if (fieldType === ALLOWED_FIELDS_TYPES[9]) {
            fieldRef = f[2];
            isArray = f[3] === ALLOWED_FIELDS_TYPES[8];
        } else {
            isArray = f[2] === ALLOWED_FIELDS_TYPES[8];
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
    return console.log(msg);
}
