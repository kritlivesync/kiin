/**
 * @controllerName : {databaseName}=>{serviceName}
 * @action : list
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{databaseName}/{serviceName}/')
    .get(async(req, res) => {
        var data = await S._{serviceName}.list(req, res)
        res.json(data);
    })
};