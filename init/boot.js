module.exports = function(app) {
    var
        bodyParser = require('body-parser'),
        Session = require('express-session'),
        compression = require('compression'),
        RedisStore = require('connect-redis')(Session),
        swig = require('swig'),
        multer = require('multer');

    L.session  = Session({
        store: new RedisStore({ client: R }),
        secret: C.secret,
        resave: true,
        saveUninitialized: true,
        proxy: true
    });

    // app use
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.engine('html', swig.renderFile);
    app.use(compression())
    app.set('view engine', 'html');
    app.set('views', C.dir.view);
    app.use(multer({ dest: C.dir.static }).any());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use( L.session);

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

};