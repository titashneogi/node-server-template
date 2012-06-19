var testHelper = require('../../lib/testHelper');
var expect = require('expect.js');
var should = require('should');

describe('homeController', function() {
  before(function(done) {
    testHelper.startServer(done);
  });
  after(function(done) {
    testHelper.stopServer(done);
  })

  it('should support /home/hello', function(done) {
    var api = {method:'get',url:'/home/hello'};
    testHelper.login('testUserName', api);
    testHelper.makeRequest(api, function(err, response) {
      if (err) throw err;
      var json = JSON.parse(response.body);
      expect(json).to.have.keys(['hello']);
      json.hello.should.equal('world');
      done();
    });
  });

  it('should support /home/status', function(done) {
    var api = {method:'get',url:'/home/status'};
    testHelper.login('testUserName', api);
    testHelper.makeRequest(api, function(err, response) {
      if (err) throw err;
      response.statusCode.should.equal(200);
      response.body.should.equal('OK')
      done();
    });
  });

    it('should support /home/oops', function(done) {
    var api = {method:'get',url:'/home/oops'};
    testHelper.login('testUserName', api);
    testHelper.makeRequest(api, function(err, response) {
      if (err) throw err;
      response.statusCode.should.equal(400);
      response.body.should.equal('{"statusCode":400,"message":"something went wrong"}')
      done();
    });
  });

});