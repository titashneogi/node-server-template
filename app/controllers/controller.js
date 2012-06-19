var _ = require('underscore');
var util = require('util');
var logger = require('../../lib/logger');


/**
  All controller methods should forwad the request chain through this central method.

  - req: request
  - res: response
  - next: next function in Express filter chain
  - err: optional string or object describing error, if any
  - data: body/data to send to client (usually json format)
  - options
    - statusCode: to override default 200 or 400
    - statusResponse: if true, do not send json body (else default to json content type)
*/
function sendNext(req, res, next, err, data, options) {
  if (err) {
    sendError(req, res, err, options);
  } else if (options && options.statusResponse) {
    sendTextResponse(req, res, data, options) 
  } else {
    sendJsonResponse(req, res, data, options);
  }
  next();
  
}

/**
  - options
    - statusCode
    - message
*/
function sendError(req, res, err, options) {
  if (!options) options = {};
  if (!options.headers) options.headers = {};
  if (!options.message) {
    options.message = (err && (typeof err === "string")) ? err : "Error";
  }
  if (!options.statusCode || (options.statusCode < 400)) {
    options.statusCode = 400;
  }
  options.body = JSON.stringify({statusCode: options.statusCode, message: options.message});
  options.headers['content-type'] = 'application/json;charset=utf-8';
  sendResponse(req, res, options);
}


/**
  - options
    - statusCode
*/
function sendJsonResponse(req, res, json, options) {
  if (!options) options = {};
  if (!options.headers) options.headers = {};
  if (!options.statusCode) options.statusCode = 200;
  options.body = JSON.stringify(json) || "";
  options.headers['content-type'] = 'application/json;charset=utf-8';
  sendResponse(req, res, options);
}


/**
  - options
    - statusCode
*/
function sendTextResponse(req, res, text, options) {
  if (!options) options = {};
  if (!options.statusCode) options.statusCode = 200;
  options.body = (text && (typeof text === "string")) ? text : "OK";
  sendResponse(req, res, options);
}

/**
  Send response to client.
  - options
    - statusCode is an integer HTTP status code (default 200)
    - body is a string (assumed JSON format). If not provided, this is generated from the status code and message.
    - headers is a optional hash of headers for the response. This will overwrite any existing headers.
    - message is an optional error log message
*/
function sendResponse(req, res, options) {
  if (options && options.headers) {
    _.each(options.headers, function(value, key) {
      res.setHeader(key, value);
    });
  }
  res.setHeader('Pragma', "no-cache");
  res.setHeader('Cache-Control',"no-cache, no-store, max-age=0, must-revalidate");
  res.setHeader('Expires',"0");
  // if (Server.isShuttingDown()) {
  //   res.setHeader('Connection', 'close');
  // }

  var statusCode = (options && options.statusCode) ? options.statusCode : 200;
  res.writeHead(statusCode);

  var body = (options && options.body) ? options.body : "";
  res.end(body);

  logResponse(req, res.statusCode, body.length);
}

/**
  Log response to client
*/
function logResponse(req, statusCode, length, err) {
  var runtime = 0;//Date.now() - req.startTime;
  var userId = 0;
  var maskedUrl = req.originalUrl.replace(/password=[^&?]*/g, "password=***");
  var clientIP = req.headers['client_ip'] || req.connection.remoteAddress  || 'unknown';
  var info = ["API:"];
  info.push(clientIP);
  info.push(userId);
  info.push('"' + req.method + ' ' + maskedUrl + ' ' + req.httpVersion + '"');
  info.push(statusCode);
  info.push(length);
  info.push(runtime);
  //info.push(req.rid);

  var logLine = info.join(' ');
  if (err && err.stack) {
    logger.fatal(info.join(' ') + err.stack);
  } else if (err) {
    logger.error(info.join(' '));
  } else {
    logger.info(info.join(' '));
  }
}

// ===== PUBLIC ======
module.exports.sendError = sendError;
module.exports.sendNext = sendNext;


