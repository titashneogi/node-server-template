# Node Server Template Project

This is a template project that captures my favorite starting point for writing node.js servers.  It creates an express server, initializes it given environment-based configurations, creates routes with before/after filters, and provides a light test framework using mocha.


# Installation

  * install node.js:  see http://nodejs.org
  * checkout code: git clone https://github.com/braitz/node-server-template.git
  * install library dependencies
    cd node-server-template
    npm install -d
  * run tests (see package.json scripts test)
    chomod +x makefile
    npm test
  * start server (see package.json scripts start)
    npm start


# Features

## App/Server

  app.js is where it all starts:  this file manages command line arguments, starting and initializing the server, and capturing uncaught exceptions.  To view server routes, try

  $ node app.js -r

  app/server.js is where the actual express server code lives.  This was separated to help support tests.

## Config

  The config directory contains js files mapping to each environment option.  (NODE_ENV=development maps to config/development.js).  It was easier and faster to represent config as js not json (avoid parsing, can comment code, etc).  Access config variables via:
    var env = require('../config/env');
    console.log(env.current).

## Controllers/Routes

  Each controller supports routing functions with the signature:  function foo(req, res, next).  It is important that next() is called to forward the request flow to the next function in the request filter chain.  It is easy to standardize this by using the parent controller's sendNext function.  Each server module explicitly exports routes via the routes method.

  app/routes.js will find each controller and attach routes to our express server app.  It also imposes a function filter chain for each request cycle.

## SessionController

  Each route can be associated with a role, 'user','guest','admin', which maps to a currentUser function in the filter chain which is stubbed out in the sessionController.  If credentials are acceptable, continue with the request, else return 401 Unauthorized to client.

##  Mocha Tests

  Since we know all the server routes, we can generate acceptance tests using:

  $ node test/lib/generateControllerTests.js

  Generated tests are temporarily stored in test/recordings/controllerTests and can be copied and edited as needed.

  The current test/app/controller tests are live server tests and therefore might really belong in an integration-test-server environment...  But for now, I use testHelper to help me start and stop the test server before running each controller route test.

  $ cd node-server-template
  $ chmod +x makefile
  $ make all

