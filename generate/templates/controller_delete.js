/**
 * @controllerName : {databaseName}=>{serviceName}
 * @action : delete
 */
 
 module.exports = async(app,view) => {
  app 
    .route('/api/{databaseName}/{serviceName}/delete/:id')
    .post(async(req, res) => {
        var data = await S._{serviceName}.delete(req, res)
        res.json(data);
    })
};