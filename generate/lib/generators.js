
var ft = require('./fileTools');
var formatTools = require('./formatTools');
var os = require('os');
var form_type = {
    'text':'string', 
    'textarea':'string', 
    'email':'string', 
    'phone':'string', 
    'address':'string', 
    'number':'number', 
    'date':'date', 
    'select':'boolean', 
    'text':'array', 
    'select_id':'objectId'
}
function generateModel(path, databaseName, modelName, modelFields, cb) {
    var fields = formatTools.getFieldsForModelTemplate(modelFields);
    var model = ft.loadTemplateSync('model.js');
    model = model.replace(/{fields}/g, fields);
    model = model.replace(/{databaseName}/g, databaseName);
    model = model.replace(/{modelName}/g, modelName);

    ft.createDirIfIsNotDefined(path, 'app/models', function () {
        ft.createDirIfIsNotDefined(path, 'app/models/'+databaseName, function () {
            ft.writeFile(path + '/app/models/'+databaseName+'/_' + modelName + '.js', model, null, cb);
        });
    });
}

function generateController(path, databaseName, modelName, cb) {
    var router_index = ft.loadTemplateSync('controller_index.js');
    router_index = router_index.replace(/{databaseName}/g, databaseName);
    router_index = router_index.replace(/{serviceName}/g, modelName);

    var router_view = ft.loadTemplateSync('controller_view.js');
    router_view = router_view.replace(/{databaseName}/g, databaseName);
    router_view = router_view.replace(/{serviceName}/g, modelName);

    var router_create = ft.loadTemplateSync('controller_create.js');
    router_create = router_create.replace(/{databaseName}/g, databaseName);
    router_create = router_create.replace(/{serviceName}/g, modelName);

    var router_update = ft.loadTemplateSync('controller_update.js');
    router_update = router_update.replace(/{databaseName}/g, databaseName);
    router_update = router_update.replace(/{serviceName}/g, modelName);

    var router_delete = ft.loadTemplateSync('controller_delete.js');
    router_delete = router_delete.replace(/{databaseName}/g, databaseName);
    router_delete = router_delete.replace(/{serviceName}/g, modelName);
    ft.createDirIfIsNotDefined(path, 'app/controllers/'+databaseName, function () {
        ft.createDirIfIsNotDefined(path, 'app/controllers/'+databaseName+'/'+modelName, function () {
            ft.writeFile(path + '/app/controllers/'+databaseName+'/' + modelName + '/index.js', router_index, null, ()=>{
                ft.writeFile(path + '/app/controllers/'+databaseName+'/' + modelName + '/view.js', router_view, null, ()=>{
                    ft.writeFile(path + '/app/controllers/'+databaseName+'/' + modelName + '/create.js', router_create, null, ()=>{
                        ft.writeFile(path + '/app/controllers/'+databaseName+'/' + modelName + '/update.js', router_update, null, ()=>{
                            ft.writeFile(path + '/app/controllers/'+databaseName+'/' + modelName + '/delete.js', router_delete, null, cb);
                        });
                    });
                });
            });
        });
    });
}

function generateService(path, databaseName, modelName, modelFields, cb) {
    var page = ft.loadTemplateSync('page.js');
    var service = ft.loadTemplateSync('service.js');
    var formFields = os.EOL+'\t\t\t\t\tkey:"root-'+modelName+'",title:"'+formatTools.capitalizeFirstLetter(modelName)+'",'+os.EOL+'\t\t\t\t\trow:[' + os.EOL

    var updateFields = '/*'+os.EOL;
    var createFields = os.EOL;
    var refFields = os.EOL;

    modelFields.forEach(function (f, index, fields) {
        var field = f.name;
        updateFields += field;
        updateFields += os.EOL + '\t\t\t';
        createFields += '\t\t\t' + field + ' : req.body.' + field;
        createFields += ((fields.length - 1) > index) ? ',' + os.EOL : '';
    });
    updateFields += '*/';

    modelFields.forEach(function (f, index, fields) {
        if(form_type[f.type]=='objectId'){
            refFields += '\t\t'+`option.${f.name} = await D.${databaseName}.${f.reference}.find({},'_id,${form_type[modelFields[0].type]=='string'? modelFields[0].name : 'label'}')` + os.EOL
        }
        if(form_type[f.type]=='boolean'){
            refFields += '\t\t'+`option.${f.name} = [{key:true,label:'On'},{key:false,label:'Off'}]` + os.EOL
        }
        formFields += '\t\t\t\t\t\t{col:[' + os.EOL
        formFields += '\t\t\t\t\t\t\t{type:"'+f.type+'",key:"'+f.name+'",title:"'+formatTools.capitalizeFirstLetter(f.name)+'",placeholder:"Please add '+formatTools.capitalizeFirstLetter(f.name)+'"}' + os.EOL
        formFields += '\t\t\t\t\t\t]},'  + os.EOL  
     
    });


    formFields += '\t\t\t\t\t]' + os.EOL+'\t\t\t\t'

    service = service.replace(/{databaseName}/g, databaseName);
    service = service.replace(/{modelName}/g, '_'+modelName);
    service = service.replace(/{name}/g, modelName);

    service = service.replace(/{serviceName}/g, formatTools.capitalizeFirstLetter(modelName) + 'Service');
    service = service.replace(/{createFields}/g, createFields);
    service = service.replace(/{updateFields}/g, updateFields);
    service = service.replace(/{formFields}/g, formFields);
    service = service.replace(/{refFields}/g, refFields);

    page = page.replace(/{databaseName}/g, databaseName);
    page = page.replace(/{modelName}/g, modelName);
    page = page.replace(/{componentName}/g, formatTools.capitalizeFirstLetter(modelName));
    page = page.replace(/{index}/g,  form_type[modelFields[0].type]=='string'? modelFields[0].name : 'label');
    page = page.replace(/{indexName}/g,  formatTools.capitalizeFirstLetter(form_type[modelFields[0].type]=='string'? modelFields[0].name : 'label'));


    ft.createDirIfIsNotDefined(path, 'pages/'+databaseName, function () {
        ft.createDirIfIsNotDefined(path, 'pages/'+databaseName+'/' + modelName, function () {
            ft.createDirIfIsNotDefined(path, 'app/services', function () {
                ft.writeFile(path + '/app/services/_' + modelName + '.js', service, null, ()=>{
                     ft.writeFile(path + '/pages/'+databaseName+'/' + modelName + '/index.js', page, null, cb);
                });
            });
        });
    });

}

module.exports = {
    generateModel: generateModel,
    generateController: generateController,
    generateService: generateService
};
