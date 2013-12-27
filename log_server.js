/**
 * Module dependencies.
 */

var locomotive = require('locomotive')
  , os = require('os')
  , cluster = require('cluster')
  , nconf = require('nconf')
  , winston = require('winston');

nconf.argv()
     .env()
     .add( 'global', {file: __dirname + '/config/' + process.env.NODE_ENV + '.json',  type: 'file'})
     .add( 'user', {file: __dirname + '/config/default.json', type: 'file'});
     
/**
 * Environment.
 */
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'
  , port = nconf.get('listen_port')
  , numCPUs = nconf.get('cluster_workers') === 'max' ? 
    os.cpus().length : nconf.get('cluster_workers');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  timestamp: true,
  colorize: true
})

if(nconf.get('file_logger'))
  winston.add(winston.transports.File, {
    colorize: true,
    timestamp: true,
    filename: 'logs/express.log',
    maxsize: 10240,
    maxFiles: 10
  })
/**
 * Boot the application.
 */

locomotive.boot(__dirname, env, function(err, express) {
  if (err) {
    throw err;
  }

  // If the app is started in production node, spawn 1 worker per core
  if (cluster.isMaster && env === 'production') {
    for (var i = 0; i < numCPUs; i++) {
      var worker = cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      winston.log('error', 'worker ' + worker.process.pid + ' died');
      winston.log('info','respawning another worker...');
      cluster.fork();
    });
    cluster.on('listening', function(worker, address) {
      winston.log('info','worker ' + worker.process.pid + ' listening');
    });
    cluster.on('fork', function(worker) {
      winston.log('info','worker ' + worker.process.pid + ' forked');
    });
    cluster.on('online', function(worker) {
      winston.log('info','worker ' + worker.process.pid + ' online');
    });
  } else {

    this.winston = winston;
    express.listen(port, function() {
      winston.log('info','Locomotive %s application starting in %s on http://%s:%d', locomotive.version, env, '0.0.0.0', port)
    });
  }
});