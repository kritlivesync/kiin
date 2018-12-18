function eachService(dir) {
    F.file.readdirSync(dir).forEach((name) => {
        if (F.path.extname(name) == '.js') {
            var _name = F.path.basename(name, '.js');
            var _key = dir.split('/').slice(-1).pop()
            if (_key == 'services') {
                S[_name] = require(F.path.join(dir, name));
            }
        } else if (name !== '.DS_Store') {
            eachService(F.path.join(dir, name));
        }
    })
}

if (C.dir.service) {
    eachService(C.dir.service);
}