/**
 * @controllerName : {databaseName}=>{serviceName}
 * @action : create
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{databaseName}/{serviceName}/create')
    .post(async(req, res) => {
        var data = await S._{serviceName}.create(req, res)
        res.json(data);
    })
};
