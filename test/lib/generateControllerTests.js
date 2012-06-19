/**
  Generate controller tests given application route definitions
 
  command:  node generateControllerTests.js
  Generated files will be stored in CONTROLLER_TESTS_DIR.
*/
var routes = require("../../app/routes");
var fs = require('fs');
var _ = require('underscore');


// create recording directory
var RECORDING_DIR = __dirname + '/../recordings';
var CONTROLLER_TESTS_DIR = RECORDING_DIR + '/controllerTests';
fs.mkdir(RECORDING_DIR);
fs.mkdir(CONTROLLER_TESTS_DIR);
console.log("creating directory: " + CONTROLLER_TESTS_DIR);


function beginningTestFile(testName) {
  var a = [];
  a.push("var testHelper = require('../../lib/testHelper');");
  a.push("var expect = require('expect.js');");
  a.push("var should = require('should');");
  a.push("")
  a.push("describe('" + testName + "', function() {");
  return a.join('\n');
}

function endTestFile() {
  var a = [];
  a.push("")
  a.push("});")
  return a.join('\n');
}

function createTestMethodForRoute(route) {
  var a = [];
  a.push("");
  a.push("  it('should support " + route.path + "', function(done) {");
  a.push("    var api = {method:'" + route.method + "',url:'" + route.path + "'};");
  a.push("    testHelper.login('testUserName', api);");
  a.push("    testHelper.makeRequest(api, function(err, response) {");
  a.push("      if (err) throw err;");
  a.push("      // var json = JSON.parse(response.body);");
  a.push("      // expect(json).to.have.keys(['a','b','c']);");
  a.push("      console.log('pending');");
  a.push("      done();");
  a.push("    });");
  a.push("  });");
  return a.join('\n')
  
}

// for each controller route
_.each(routes.controllerRoutes(), function(routes, controllerName) {

  // build content
  var content = [];
  content.push(beginningTestFile(controllerName));
  routes.forEach(function(r) {
    content.push(createTestMethodForRoute(r));
  })
  content.push(endTestFile());
  
  // save to file
  var filename = controllerName + ".test.js";
  fs.writeFile(CONTROLLER_TESTS_DIR + "/" + filename, content.join('\n'), function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("saved " + CONTROLLER_TESTS_DIR + "/" + filename);
    }
  });
  
});

