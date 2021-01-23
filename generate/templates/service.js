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
    var data,
        options,
        input = req.query,
        current = +input.page || 1,
        search = input.search
            ? JSON.parse(new Buffer(input.search, 'base64').toString('ascii'))
            : false,
        conditions = {},
        page = {
            showQuickJumper:true,
            current: current,
            pageSize: 10,
        };


        if (search.date_create) {
            conditions.date_create = {
                $gte: new Date(search.date_create[0]),
                $lt: new Date(search.date_create[1]),
            };
            delete search.date_create;
        }

        if (Object.keys(search).length >= 1) {
            Object.keys(search).map(item => {
                conditions[item] =
                    D.{databaseName}.{modelName}.schema.paths[item].instance == 'String'
                        ? { $regex: search[item], $options: 'i' }
                        : search[item];
            });
        }

        console.log('conditions====>', conditions);

        options = {
            limit: page.pageSize,
            sort: {_id: -1},
            skip: (page.current - 1) * page.pageSize,
        };

        if (input.sortField && input.sortOrder && input.sortField != 'undefined') {
            options.sort[input.sortField] = input.sortOrder == 'ascend' ? 1 : -1;
        } else {
            options.sort = { _id: -1 };
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

AccountService.export = async (req, res) => {
    try {
        var data = new Buffer(req.params.query, 'base64').toString('ascii');
        var data_allow = {};
        var data_list = [];
        var data_sheet = [];
        var return_data = JSON.parse(data);
        var query_command = '';
        var query_data = [];
        if(return_data.full){
            delete return_data.full
        }
        if (return_data.date_create) {
            var date_select = {
                date_create: {
                    $gte: new Date(return_data.date_create[0]),
                    $lt: new Date(return_data.date_create[1]),
                },
            };
            query_data.push(date_select);
            delete return_data.date_create;
        }

        if (Object.keys(return_data).length >= 1) {
            var option_data = {};
            Object.keys(return_data).map(item => {
                if (return_data[item].toString() != '') {
                    option_data[item] = return_data[item];
                }
            });
            if (option_data != {} && Object.keys(option_data).length >= 1) {
                query_data.push(option_data);
            }
        }

        query_command =
            query_data.length >= 2
                ? { $and: query_data }
                : query_data[0]
                ? query_data[0]
                : {};
        data_allow = {
            _id: 1,
        };
        data_list = await D.{databaseName}.{modelName}.find(query_command);
        data_sheet = [Object.keys(data_allow)].concat(
            data_list.map(item => {
                return Object.keys(data_allow).map(node => {
                    return item._doc[node] ? item._doc[node].toString() : '';
                });
            })
        );

        var wb = F.excel.utils.book_new();
        F.excel.utils.book_append_sheet(
            wb,
            F.excel.utils.aoa_to_sheet(data_sheet),
            '{modelName}'
        );

        return {
            type: 'xlsx',
            data: F.excel.write(wb, {
                type: 'buffer',
                bookType: 'xlsx',
            }),
        };
    } catch (err) {
        console.log('err==>', err);
        return { type: 'excel', data: [] };
    }
};

module.exports = {serviceName};