/**
 * @serviceName : {serviceName}
 * @modelName : {modelName}
 * @name : {name}
 * @description : logic for managing {name}.
 */

const {serviceName} = () => {}

{serviceName}.form_view = async(req, res) => {

    var 
        option={}
        form = {
            view:[
                {{formFields}}
              ],
            add:[
                {{formFields}}
              ],
            edit:[
                {{formFields}}
              ]
          }

        {refFields}

        return { form, option };
}

{serviceName}.form_add = async(req, res) => {
    var
        data, options, form,
        input = req.query,
        current = +input.page || 1
        conditions = {},
        page = {
            current: current,
            numRange: 4,
            size: 10
        };

        options = {
            limit: page.size,
            sort: {_id: -1},
            skip: (page.current - 1) * page.size
        };

        data = await D.{modelName}.find(conditions, null, options); //.populate('db filed');
        page.rowCount = await D.{modelName}.count(conditions);
        page.pageCount = Math.ceil(page.rowCount / page.size);

        
        return {
            status: true,
            data: {
                data: data,
                info: page
            }
        };
}

{serviceName}.form_edit = async(req, res) => {
    var
        data, options,
        input = req.query,
        current = +input.page || 1
        conditions = {},
        page = {
            current: current,
            numRange: 4,
            size: 10
        };

        options = {
            limit: page.size,
            sort: {_id: -1},
            skip: (page.current - 1) * page.size
        };

        data = await D.{modelName}.find(conditions, null, options); //.populate('db filed');
        page.rowCount = await D.{modelName}.count(conditions);
        page.pageCount = Math.ceil(page.rowCount / page.size);

        return {
            status: true,
            data: {
                data: data,
                info: page
            }
        };
}

{serviceName}.list = async(req, res) => {
    var
        data, options,
        input = req.query,
        current = +input.page || 1
        conditions = {},
        page = {
            current: current,
            numRange: 4,
            size: 10
        };

        options = {
            limit: page.size,
            sort: {_id: -1},
            skip: (page.current - 1) * page.size
        };

        data = await D.{modelName}.find(conditions, null, options); //.populate('db filed');
        page.rowCount = await D.{modelName}.count(conditions);
        page.pageCount = Math.ceil(page.rowCount / page.size);

        form = await {serviceName}.form_view()

        return {
            status: true,
            data: {
                ...form,
                data: data,
                info: page
            }
        };
}

{serviceName}.view = async(req, res) => {
    var data = await D.{modelName}.findOne({
        _id: D.ObjectId(req.params.id)
    }); //.populate('db filed');

    return {
        status: true,
        data: data
    };
}

{serviceName}.create = async(req, res) => {
    var 
        input = {{createFields}
        };

        return (await D.{modelName}.create(input)) ?
            { 
                status: true,
                msg: 'add success'
            } : {
                status: false,
                msg :'add false'
            }
}

{serviceName}.update = async(req, res) => {
    var 
        input = req.body;

        return (await D.{modelName}.findOneAndUpdate({_id: req.params.id}, input)) ?
            { 
                status: true,
                msg: 'update success'
            } : {
                status: false,
                msg :'update false'
            }
}

{serviceName}.delete = async(req, res) => {
    return (await D.{modelName}.remove({_id: req.params.id})) ? 
        { 
            status: true,
            msg: 'delete success'
        } : {
            status: false,
            msg :'delete false'
        }
}

module.exports = {serviceName};