var express = require('express')
  , poweredBy = require('connect-powered-by')
  , util = require('util')
  , nconf = require('nconf')
  , winston = require('winston');

nconf.argv()
     .env()
     .add( 'global', {file: __dirname + '/../' + process.env.NODE_ENV + '.json',  type: 'file'})
     .add( 'user', {file: __dirname + '/../default.json', type: 'file'});;

module.exports = function() {
  // Warn of version mismatch between global "lcm" binary and local installation
  // of Locomotive.
  if (this.version !== require('locomotive').version) {
    //console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
  }
  //console.log(this)
  //winston = this.winston;
  //winston.info('hi')
  // Configure application settings.  Consult the Express API Reference for a
  // list of the available [settings](http://expressjs.com/api.html#app-settings).
  this.set('views', __dirname + '/../../app/views');
  this.set('view engine', 'jade');

  // Register EJS as a template engine.
  this.engine('jade', require('jade').__express);

  // Override default template extension.  By default, Locomotive finds
  // templates using the `name.format.engine` convention, for example
  // `index.html.ejs`  For some template engines, such as Jade, that find
  // layouts using a `layout.engine` notation, this results in mixed conventions
  // that can cuase confusion.  If this occurs, you can map an explicit
  // extension to a format.
   this.format('html', { extension: '.jade' }) 

  // Register formats for content negotiation.  Using content negotiation,
  // different formats can be served as needed by different clients.  For
  // example, a browser is sent an HTML response, while an API client is sent a
  // JSON or XML response.
  /* this.format('xml', { engine: 'xmlb' }); */

  // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
  // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
  // middleware available as separate modules.

  var allowCrossDomain = function(req, res, next) {
    winston.info('Allowing Cross Domain')
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS,POST');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
    if(req.method === 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
  }

  //Cache Control Header
  var cacheControl = function(policy) {
    return function(req, res, next) {
      res.header('Cache-Control', policy)
      //'public, must-revalidate, max-age=0'
      next();
    }
  }
  var winstonStream = {
      write: function(message, encoding){
          winston.info(message);
      }
  };
  if(nconf.get('cache_control'))
    this.use(cacheControl(nconf.get('cache_control')))
  if(nconf.get('gzip'))
    this.use(express.compress());
  if(nconf.get('allow_cross_domain'))
  {
    winston.info('Cross Domain Requests Enabled')
    this.use(allowCrossDomain);
  }
  if(nconf.get('cookie_key'))
    this.use(express.cookieParser(nconf.get('cookie_key')))
  else
    this.use(express.cookieParser())
  if(nconf.get('basic_auth'))
    this.use(express.basicAuth(nconf.get('basic_auth_username'), nconf.get('basic_auth_password')))
  this.use(poweredBy('Locomotive'));
  this.use(express.logger({stream:winstonStream}));
  this.use(express.favicon());
  this.use(express.static(__dirname + '/../../public'));
  this.use("/resources", express.static(__dirname + '/../../resources'));
  this.use(express.bodyParser());
  this.use (function(req, res, next) {
      if(req.headers && req.headers['user-agent'] && (req.headers['user-agent'].indexOf('MSIE 9.0') > -1 || req.headers['user-agent'].indexOf('MSIE 8.0') > -1 || req.headers['user-agent'].indexOf('MSIE 10') > -1) && req.method.toLowerCase() ==='post')
      {
        //console.log('hihihihi')
        winston.log('IE CORS Request Detected, Using Custom Parser...')
        var data='';
        req.setEncoding('utf8');
        req.on('data', function(chunk) { 
           data += chunk;
        });

        req.on('end', function() {
            var parsed;
            try{ parsed = JSON.parse(data);}
            catch(e) {
              parsed = data
            }
            //console.log('parsed')
            //console.log(parsed)
              req.body = parsed;
            next();
        });
      }
      else
      {
        next()
      }
  });
  this.use(express.methodOverride());
  this.use(this.router);

  this.use(function(req, res, next){
    res.status(404).send('404 Page Not Found');
    //Add your own 404 Page Not Found here
  });
}
