const SocketServer = async(req, ws, io) => {
    var sub = R.instance()
    var room = req.session.login? ["public","user:"+req.session.user._id] : ["public"]
    
    sub.subscribe(room);
    sub.on("message", function(channel, message) {
      console.log("send '" + message + "' to client")
      ws.send(message, () => {}); //json stringify
    });

    ws.on('message', async(input) => {
        var
            arg = JSON.parse(input);
        io.emit(arg.type, arg.data);
    });

    ws.on('close', async() => {
        console.log("close client")
        sub.quit();
    });
};
module.exports = SocketServer;