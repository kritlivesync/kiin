/**
 * @serviceName : {databaseName}=>{serviceName}
 * @modelName : {modelName}
 * @name : {name}
 * @description : logic for managing {name}.
 */

const {serviceName} = () => {}

{serviceName}.form_view = async(req, res) => {
    var 
        option = {},
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


{serviceName}.list = async(req, res) => {
    var
        data, options,
        input = req.query,
        current = +input.page || 1
        conditions = {},
        page = {
            current: current,
            pageSize: 10
        };


        options = {
            limit: page.pageSize,
            sort: {},
            skip: (page.current - 1) * page.pageSize
        };

        if(input.sortField && input.sortOrder){
           options.sort[input.sortField] = input.sortOrder=='ascend'? 1 : -1
        }else{
            options.sort = {_id: -1}
        }

        data = await D.{databaseName}.{modelName}.find(conditions, null, options); //.populate('db filed');
        page.total = await D.{databaseName}.{modelName}.count(conditions);
        page.pageCount = Math.ceil(page.total / page.pageSize);

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
    var data = await D.{databaseName}.{modelName}.findOne({
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

        return (await D.{databaseName}.{modelName}.create(input)) ?
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

        return (await D.{databaseName}.{modelName}.findOneAndUpdate({_id: req.params.id}, input)) ?
            { 
                status: true,
                msg: 'update success'
            } : {
                status: false,
                msg :'update false'
            }
}

{serviceName}.delete = async(req, res) => {
    return (await D.{databaseName}.{modelName}.remove({_id: req.params.id})) ? 
        { 
            status: true,
            msg: 'delete success'
        } : {
            status: false,
            msg :'delete false'
        }
}

module.exports = {serviceName};