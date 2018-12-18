module.exports = async(app,view) => {
  app 
    .route('/item/:id')
    .get(async(req, res) => {
        return view.render(req, res, '/item', { id: req.params.id })
    })
};