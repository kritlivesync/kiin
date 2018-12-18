function eachMiddle(dir) {
    F.file.readdirSync(dir).forEach((name) => {
        if (F.path.extname(name) == '.js') {

            var _name = F.path.basename(name, '.js');
            var _key = dir.split('/').slice(-1).pop()

            if (_key == 'middles') {
                M[_name] = require(F.path.join(dir, name));
            }

        } else if (name !== '.DS_Store') {
            eachMiddle(F.path.join(dir, name));
        }
    })
}
if (C.dir.middle) {
    eachMiddle(C.dir.middle);
}