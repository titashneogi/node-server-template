/**
  Home of the main server object
*/
var express = require('express');
var _ = require('underscore');
var routes = require('./routes');
var env = require('../config/env');
var logger = require('../lib/logger');


function initLibs(callback) {
  logger.init(env.current.logger);
	return callback();
}


function closeLibs(callback) {
	return callback();  // OK
}

// ===== Server ===============================================================

// create our server
function Server(config) {
	var self = this;

	// init config
	self.config = {
		server: 'localhost',
		port: 3000
	};
	if (config) {
		_.extend(self.config, config);
	}

	// Express app initialization
  var app = express.createServer();
  app.configure(function(){
	  app.set('views', __dirname + '/views');
	  app.use(express.bodyParser());
	  app.use(express.cookieParser());
	  app.use(express.methodOverride());
	  app.use(app.router);
	  app.use(express.static(__dirname + '/../public'));
	});

  app.configure('test', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

	app.configure('development', function(){
	  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});

	app.configure('production', function(){
	  app.use(express.errorHandler());
	});

  // hold on to settings
  self.server = app;
  self.routes = routes.buildRoutes(self.server);
  self.isShuttingDown = false;
}


Server.prototype.init = function(callback) {
  initLibs(callback);
}


Server.prototype.start = function(options) {
	var self = this;
	if (!self.server) {
     throw new Error('Server not found');
  }
  if (options) {
    _.extend(self.config, options);
  }
  self.server.listen(self.config.port, undefined, function (callback) {
    if (self.server.settings.env != 'test') {
      console.log("server listening on port %s in %s mode", 
                  self.server.address().port, 
                  self.server.settings.env);
    }
  });
}


Server.prototype.stop = function(exitCode) {
	var self = this;

  self.isShuttingDown = true;
  console.log("Stopping server");
  closeLibs(function(err) {
    if (err) console.log("Error closing libs: %s", err);

    if (typeof exitCode != 'undefined') {
      // exit 0 is success, 1 is error, 13 is fatal
      process.exit(exitCode);
    } else if (self.server) {
    	self.server.close();
    }
  })
}


var FATAL_EXIT_CODE = 13;
Server.prototype.fatal = function(errorMessage) {
	var self = this;

  if (!errorMessage) errorMessage = "SHUTDOWN";
  console.log(errorMessage);
  Logger.fatal(errorMessage); 
  Logger.flush(function() {
  	this.stop(FATAL_EXIT_CODE);
  });
}

Server.prototype.isShuttingDown = function isShuttingDown() {
  return self.isShuttingDown;
}

module.exports.Server = Server;

