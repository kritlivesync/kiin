var
    funcs,
    url = require('url'),
    swig = require('swig'),
    crypto = require('crypto'),
    lodash = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    uuid = require('uuid/v4'),
    moment = require('moment'),
    exec = require('child_process').exec,
    nodemailer = require('nodemailer');

global._ = lodash;

funcs = {
    id: uuid,
    swig: swig,
    date: moment,
    exec: exec,
    path: path,
    url: url,
    file: fs,
    pass: {
        generate: function(password) {
            var salt = crypto.randomBytes(8).toString('hex').slice(0, 16)
            var hash = crypto.createHmac('sha512', salt).update(password).digest('hex');
            return {
                salt: salt,
                hash: hash
            };
        },
        compare: function(data, password) {
            var hash = crypto.createHmac('sha512', data.salt).update(password).digest('hex');
            return (data.hash && data.hash == hash) ? true : false;
        }
    },
    tpl: function(path,data){
        return swig.compileFile(C.dir.view + path);
    },
    random: function(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    },
    mail: function(to, title, message, cb) {
        console.log(to, title, message);
        var transporter = nodemailer.createTransport('smtps://no-reply%40mailsmtp.com:qazwsx123@smtp.gmail.com');

        var mailOptions = {
            from: '"No Reply" <no-reply@mailsmtp.com>',
            to: to,
            subject: title,
            html: message
        };

        transporter.sendMail(mailOptions, function(error, info) {
            console.log(error, info)
            cb(true);
        });
    },
    agent: function(ua) {
        var data = '';
        if (/mobile/.test(ua)) {
            return 'mobile';
        } else if (/Web0S/.test(ua)) {
            return 'Web0S';
        } else if (/Tizen/.test(ua)) {
            return 'Tizen';
        } else if (/TV/.test(ua)) {
            return 'TV';
        } else if (/CFNetwork/.test(ua)) {
            return 'CFNetwork';
        } else if (/AppleCoreMedia/.test(ua)) {
            return 'AppleCoreMedia';
        } else if (/stagefright/.test(ua)) {
            return 'stagefright';
        } else if (/okhttp/.test(ua)) {
            return 'Android';
        } else if (/iPhone/.test(ua)) {
            return 'iPhone';
        } else if (/Mac/.test(ua)) {
            return 'Mac';
        } else if (/Android/.test(ua)) {
            return 'Android';
        } else {
            return 'Brownser'
        }
    },
    uploadfile: function(base64str, relative_path) {
        console.log('====>' + base64str);
        var matches = base64str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        console.log(matches);
        if (matches != null) {
            base64str = uuid() + '.jpg';

            fs.writeFileSync(path.join(C.dir.public, relative_path) + base64str, new Buffer(matches[2], 'base64'));
            return relative_path + base64str;
        } else {
            return base64str;
        }
    },
    encrypt: function(pwd) {
        return crypto.createHash('md5').update(pwd).digest('hex');
    }
}

module.exports = funcs;