module.exports = function(app, view) {
    function eachFiles(dir) {
        F.file.readdirSync(dir).forEach((name) => {
            if (F.path.extname(name) == '.js') {
                require(F.path.join(dir, name))(app,view);
            } else if (name !== '.DS_Store') {
                eachFiles(F.path.join(dir, name));
            }
        })
    }
    eachFiles(C.dir.controller);
};