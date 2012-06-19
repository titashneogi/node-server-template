var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var sessionController = require('./controllers/sessionController');


/**
  Query all the controllers for routes.  Return hash of routes by controller.
  Example: 
    {homeController:[{ method: 'get', path: '/home', action: 'home', role: 'user', name: 'homeController' }]}
*/
module.exports.controllerRoutes = function controllerRoutes() {
  var routeConfigs = {};
  var controllerDir = path.resolve(__dirname, 'controllers');
  fs.readdirSync(controllerDir).forEach(function (x) {
    // find controller module
    var controllerName = x.replace(/\.js$/, '');
    var module = require(path.resolve(controllerDir, controllerName));
    // if controller module has routes, capture them
    if (module.routes) {
      routeConfigs[controllerName] = [];
      module.routes().forEach(function(r) {
        routeConfigs[controllerName].push(_.extend(r, {name:controllerName}))
      })
    }
  });
  return routeConfigs;
}


/**
  First method in the filter chain.  Start timer.
*/
function beforeFilter(routeConfig) {
  var result = function(req, res, next) {
    req.startTime = Date.now(); // start now
    req.routeConfig = routeConfig; // for debug reference
    // forward to the next method in filter chain
    next();
  };
  return result;
}


/**
  End the method filter chain by doing nothing
*/
function finalFilter(req, res, next) {
  // do nothing
}


/**
  Attach our routes to our server
*/
module.exports.buildRoutes = function buildRoutes(app) {
  var method, currentUserFunc;
  var routeSummary = [];

  _.each(module.exports.controllerRoutes(), function(routes, controllerName) {
    routes.forEach(function(route) {

      method = route.method || 'get';
      routeSummary.push(method + " " + route.path);
      // determine user restrictions
      switch(route.role) {
        case 'guest':  currentUserFunc = sessionController.guestUser; break;
        case 'admin':  currentUserFunc = sessionController.adminUser; break;
        default: currentUserFunc = sessionController.currentUser; break;
      }
      // attach the route to our server
      app[method](route.path, beforeFilter(route),
                              currentUserFunc,
                              route.action,
                              finalFilter);
    });
  });

  // default route
  // app.get('/', function(req, res) {
  //  res.redirect('/someFolderInPublic');
  //  });

  return routeSummary;
}