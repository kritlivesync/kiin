
/**
 * @serviceName : {serviceName}.js
 * @modelName : {modelName}
 * @name : {name}
 * @description :: Server-side logic for managing {name}.
 */
const {serviceName} = () => {}

{serviceName}.getConfig = async() => {
    return C
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

        return {
            status: true,
            data: {
                data: data,
                info: page
            }
        };
}
{serviceName}.show = async(req, res) => {
    var data = await D.{modelName}.findOne({
        _id: D.ObjectId(req.params.id);
    }); //.populate('db filed');

    return {
        status: true,
        data: data
    };
}

{serviceName}.create = async(req, res) => {
    var 
        input = {{createFields}};

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

        {updateFields}

        return (await D.{modelName}.findOneAndUpdate({_id: req.params.id}, input)) ?
            { 
                status: true,
                msg: 'update success'
            } : {
                status: false,
                msg :'update false'
            }
}
{serviceName}.update = remove(async(req, res) => {
    return (await D.{modelName}.remove({_id: req.query.id})) ? 
        { 
            status: true,
            msg: 'delete success'
        } : {
            status: false,
            msg :'delete false'
        }
})

module.exports = {serviceName};