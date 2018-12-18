module.exports = async(req, res, next) => {
	if(req.session.login==true){
		next()
	}else{
		if(req.method=='GET'){
			res.redirect('/login');
		}else{
			res.json({
			  status: true,
			  msg: 'Permission denied'
			});
		}
	}

};