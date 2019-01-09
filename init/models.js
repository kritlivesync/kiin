var
    db = {},
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.Promise = global.Promise;
D.ObjectId = mongoose.mongo.ObjectId;
D.ObjectValid = mongoose.Types.ObjectId.isValid;
function eachModel(db, dir) {
    F.file.readdirSync(dir).forEach((name) => {
        if (F.path.extname(name) == '.js') {

            var _name = F.path.basename(name, '.js');
            var _key = dir.split('/').slice(-1).pop()
            
            if (_key != 'models') {
                console.log('Connect : '+_key+' ====> ' +_name)
                D[_key][_name] = db[_key].model(_name, require(F.path.join(dir, name))(Schema));
            }

        } else if (name !== '.DS_Store') {
            eachModel(db, F.path.join(dir, name));
        }
    })
}

if (C.db && C.db.uri!='') {
    Object.keys(C.db).map(item=>{
       db[item] = mongoose.createConnection(C.db[item].uri, C.db[item].opts); 
       D[item]={}
    })
    
    eachModel(db, C.dir.model);
}