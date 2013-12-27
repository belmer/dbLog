var nconf = require('nconf'),
    glob = require('glob');
nconf.argv()
    .env()
    .add( 'global', {file: __dirname + '/../' + process.env.NODE_ENV + '.json',  type: 'file'})
    .add( 'user', {file: __dirname + '/../default.json', type: 'file'});
module.exports = function() {
    this.nconf = nconf;
  // Any files in this directory will be `require()`'ed when the application
  // starts, and the exported function will be invoked with a `this` context of
  // the application itself.  Initializers are used to connect to databases and
  // message queues, and configure sub-systems such as authentication.

  // Async initializers are declared by exporting `function(done) { /*...*/ }`.
  // `done` is a callback which must be invoked when the initializer is
  // finished.  Initializers are invoked sequentially, ensuring that the
  // previous one has completed before the next one executes.
}
