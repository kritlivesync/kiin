/**
 * @controllerName : {databaseName}=>{serviceName}
 * @action : view
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{databaseName}/{serviceName}/view/:id')
    .get(async(req, res) => {
        var data = await S._{serviceName}.view(req, res)
        res.json(data);
    })
};