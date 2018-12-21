
var ft = require('./fileTools');
var formatTools = require('./formatTools');
var os = require('os');
var form_type = {
    'string':'text', 
    'number':'number', 
    'date':'date', 
    'boolean':'select', 
    'array':'text', 
    'objectId':'select'
}
function generateModel(path, modelName, modelFields, cb) {
    var fields = formatTools.getFieldsForModelTemplate(modelFields);
    var model = ft.loadTemplateSync('model.js');
    model = model.replace(/{fields}/g, fields);
    model = model.replace(/{modelName}/g, modelName);

    ft.createDirIfIsNotDefined(path, 'app/models', function () {
        ft.writeFile(path + '/app/models/_' + modelName + '.js', model, null, cb);
    });
}

function generateController(path, modelName, cb) {
    var router_index = ft.loadTemplateSync('controller_index.js');
    router_index = router_index.replace(/{serviceName}/g, modelName);

    var router_view = ft.loadTemplateSync('controller_view.js');
    router_view = router_view.replace(/{serviceName}/g, modelName);

    var router_create = ft.loadTemplateSync('controller_create.js');
    router_create = router_create.replace(/{serviceName}/g, modelName);

    var router_update = ft.loadTemplateSync('controller_update.js');
    router_update = router_update.replace(/{serviceName}/g, modelName);

    var router_delete = ft.loadTemplateSync('controller_delete.js');
    router_delete = router_delete.replace(/{serviceName}/g, modelName);

    ft.createDirIfIsNotDefined(path, 'app/controllers/'+modelName, function () {
        ft.writeFile(path + '/app/controllers/' + modelName + '/index.js', router_index, null, ()=>{
            ft.writeFile(path + '/app/controllers/' + modelName + '/view.js', router_view, null, ()=>{
                ft.writeFile(path + '/app/controllers/' + modelName + '/create.js', router_create, null, ()=>{
                    ft.writeFile(path + '/app/controllers/' + modelName + '/update.js', router_update, null, ()=>{
                        ft.writeFile(path + '/app/controllers/' + modelName + '/delete.js', router_delete, null, cb);
                    });
                });
            });
        });
    });
}

function generateService(path, modelName, modelFields, cb) {

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
        if(f.type=='objectId'){
            refFields += '\t\t'+`option.${f.name} = await D.${f.reference}.find({})` + os.EOL
        }
        if(f.type=='boolean'){
            refFields += '\t\t'+`option.${f.name} = [{key:true,label:'On'},{key:false,label:'Off'}]` + os.EOL
        }
        
        formFields += '\t\t\t\t\t\t{col:[' + os.EOL
        formFields += '\t\t\t\t\t\t\t{type:"'+form_type[f.type]+'",key:"'+f.name+'",title:"'+formatTools.capitalizeFirstLetter(f.name)+'",placeholder:"Please add '+formatTools.capitalizeFirstLetter(f.name)+'"}' + os.EOL
        formFields += '\t\t\t\t\t\t]},'  + os.EOL  
     
    });


    formFields += '\t\t\t\t\t]' + os.EOL+'\t\t\t\t'


    service = service.replace(/{modelName}/g, '_'+modelName);
    service = service.replace(/{name}/g, modelName);
    service = service.replace(/{serviceName}/g, formatTools.capitalizeFirstLetter(modelName) + 'Service');
    service = service.replace(/{createFields}/g, createFields);
    service = service.replace(/{updateFields}/g, updateFields);
    service = service.replace(/{formFields}/g, formFields);
    service = service.replace(/{refFields}/g, refFields);

    ft.createDirIfIsNotDefined(path, 'app/services', function () {
        ft.writeFile(path + '/app/services/_' + modelName + '.js', service, null, cb);
    });

}

module.exports = {
    generateModel: generateModel,
    generateController: generateController,
    generateService: generateService
};
