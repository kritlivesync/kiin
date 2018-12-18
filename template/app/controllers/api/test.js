module.exports = async(app,view) => {
  app 
    .route('/api/test/:id')
    .get(async(req, res) => {
    	res.json({
    	  status: true,
    	  res: [
    	  	{name:'Item 1'},
    	  	{name:'Item 2'},
    	  	{name:'Item 3'},
    	  	{name:'Item 4'}
    	  ]
    	});
    })
};