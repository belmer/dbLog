var chai = require('chai'),
  context = describe,
  sinon = require('sinon'),
  request = require('supertest'), //('http://localhost:3000'),
  sinonchai = require('sinon-chai'),
  locomotive = require('locomotive');

chai.use(sinonchai);

var expect = chai.expect;
var addFixtureData = function(db) {}

describe('Log', function() {
  var req, db;
  before(function(done) {
    // instantiate locomotive app
    this.app = new locomotive.Locomotive();
    this.app.boot(__dirname + '/../..', 'test', function() {
      done();
    });
    req = request(this.app.express);
    db = this.app.db;
    addFixtureData(db);
    //console.log(db)
  });
});