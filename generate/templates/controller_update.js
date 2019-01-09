/**
 * @controllerName : {databaseName}=>{serviceName}
 * @action : update
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{databaseName}/{serviceName}/update/:id')
    .post(async(req, res) => {
        var data = await S._{serviceName}.update(req, res)
        res.json(data);
    })
};