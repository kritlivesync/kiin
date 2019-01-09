#!/usr/bin/env node

var fs = require('fs-extra');
var crypto = require('crypto')
var path = require('path');
var exec = require('child_process').exec;
var _exit = process.exit;


process.exit = exit

if (!exit.exited) {
  main()
}

function createApplication (name, root_path) {
  var from = path.normalize(path.join(__dirname, '..', 'template'));
  fs.copy(from, root_path, function (err) {
    if (err) {
      console.error(err);
    } else {
      var pkg = {
        name: name,
        version: '0.0.0',
        private: true,
        scripts: {
          "dev": "node server.js",
          "build": "next build",
          "start": "next start",
          "pro": "NODE_ENV=production node server.js",
          "production": "next build && pm2 start npm --name '"+name+".server' -- run pro"
        },
        dependencies: {
          "kiin":"git+https://github.com/kritlivesync/kiin.git"
        },
        devDependencies: {
          "babel-plugin-module-resolver": "^3.1.1",
          "@babel/plugin-proposal-class-properties": "^7.1.0",
          "@babel/plugin-proposal-decorators": "^7.1.0"
        }
      }

      fs.writeFileSync(root_path+'/package.json', JSON.stringify(pkg, null, 2) + '\n', { mode: parseInt('0666', 8) })

      var pkg_pm = [
        {
          "name"   : name+".server",
          "script" : "./server.js",
          "watch": [root_path+"/app/controllers",root_path+"/app/model",root_path+"/app/middle",root_path+"/app/service",root_path+"/app/view",root_path+"/app/locales"],
          "ignore_watch" : [root_path+"/upload",root_path+"/app/public"],
          "env_development" : {
            "NODE_ENV": "development",
            "NODE_KEY": name
          }
        }
      ]

      fs.writeFileSync(root_path+'/start.json', JSON.stringify(pkg_pm, null, 2) + '\n', { mode: parseInt('0666', 8) })

      var pkg_pm_pro = [
        {
          "name"   : name+".server",
          "script" : "./server.js",
          // "max_memory_restart" : "900M",
          // "exec_mode" : "cluster",
          // "instances" : 1,
          "env_production" : {
            "NODE_ENV": "production",
            "NODE_KEY": name
          }
        }
      ]

      fs.writeFileSync(root_path+'/start_pro.json', JSON.stringify(pkg_pm_pro, null, 2) + '\n', { mode: parseInt('0666', 8) })


      var getRandomArbitrary = function(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
      }

      var new_port = getRandomArbitrary(1001,9999);
      var new_ports = getRandomArbitrary(1,10);
      var new_pass = crypto.createHash('md5').update(name).digest('hex')


      var pkg_config = `var config ={
  "secret": "##IKSMTN7MELT@%!LAPE1O9P8B3",
  "port": 3${new_port},
  "domain": {
    "www": "http://127.0.0.1:3${new_port}",
    "socket": "ws://127.0.0.1:4${new_port}"
  },
  "cache": {
    "host": "127.0.0.1",
    "port": 6379,
    "prefix": "${name}:",
    "db": ${new_ports},
    "password": "7662892fa1df840b114075b32f7976b0ee027ccc",
    "autoReconnect": true
  },
  "db": {
     "main" : {
      "uri": "mongodb://127.0.0.1:27017/_${name}",
      "opts": {
        "user": "${name}",
        "pass": "${new_pass}",
        "useNewUrlParser": true
      }
    }  
  },  
  "root": __dirname,
  "dir": {
    "static": "/upload",
    "root": "/app",
    "locales": "/app/locales",
    "model": "/app/models",
    "middle": "/app/middles",
    "service": "/app/services",
    "task": "/app/tasks",
    "controller": "/app/controllers",
    "socket": "/app/socket",
    "public": "/app/public",
    "view": "/app/view"
  },
  "debug":false,
}
module.exports = config;`;





      fs.writeFileSync(root_path+'/config.js', pkg_config , { mode: parseInt('0666', 8) })


      console.log('   \x1b[36mCreate Project\x1b[0m : ' + name)
      console.log('   \x1b[36mChange config\x1b[0m : ./config.js')
      console.log('   \x1b[36mPre start\x1b[0m : npm install  --force')
      console.log('   \x1b[36mStart Project\x1b[0m : npm start')
      console.log('   \x1b[36mAdd Mongo\x1b[0m : ')
      console.log(`     $  mongo --port 27017 -u root -p 'password' --authenticationDatabase 'admin'
        > use _${name} 
        > db.createUser({user: "${name}",pwd: "${new_pass}",roles: ["readWrite"]})`
      );
      console.log('   \x1b[36mHttp Server\x1b[0m : http://127.0.0.1:3'+new_port)
    }
  });

}

function createAppName (pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

function exit (code) {
  function done () {
    if (!(draining--)) _exit(code)
  }
  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    draining += 1
    stream.write('', done)
  })

  done()
}


function main () {

  var destinationPath = path.normalize('.');
  var appName = createAppName(path.resolve(destinationPath))

  fs.readdir(destinationPath, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err

      createApplication(appName, destinationPath)

  })

}
