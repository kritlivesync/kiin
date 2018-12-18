module.exports = (server) => {
    var
        wss = require('ws').Server,
        dispatcher = require('dispatcherjs'),
    	io = new dispatcher(),
        socket = new wss({
            'server': server,
            'verifyClient': M._socket
        }),
        routeSocket = [],
        loadSocket = (dir)=>{
            F.file.readdirSync(dir).forEach((name) => {
                if (F.path.extname(name) == '.js') {
                    routeSocket.push(require(F.path.join(dir, name)));
                } else if (name !== '.DS_Store') {
                    loadSocket(F.path.join(dir, name));
                }
            })
        };
		loadSocket(C.dir.socket);
        socket.on('connection', (ws) => { 
            var 
                req = ws.upgradeReq,
                io = new dispatcher();
        	//const session = ws.upgradeReq.session;
            routeSocket.forEach((item) => {
				item(req,ws,io)
            })
    	});
};
