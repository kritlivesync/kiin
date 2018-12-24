/**
 * @controllerName : {serviceName}
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{serviceName}/:action/:id?')
    .get(async(req, res) => {
        var 
            data,
            action = req.params.action,
            allow = ['list','show','delete'];

        data = allow.indexOf(action)!=-1) ? await S._{serviceName}[action](req, res) : { status: false }
        res.json(data);
    })
    .post(async(req, res) => {
        var 
            data,
            action = req.params.action,
            allow = ['create','update'];

        data = allow.indexOf(action)!=-1) ? await S._{serviceName}[action](req, res) : { status: false }
        res.json(data);
    })
};
