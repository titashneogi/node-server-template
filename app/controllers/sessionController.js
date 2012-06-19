/**
  Manage session/login state for user
*/
var controller = require('./controller');

/**
  Register guest user, then forward to next
*/
module.exports.guestUser = function guestUser(req, res, next) {
  // TODO: not implemented; forward to next method in chain
  next();
}


/**
  Authorize this ADMIN user.  Either return error or forward to next if successful.
*/ 
module.exports.adminUser = function adminUser(req, res, next) {
  // you are not admin user -- return error
  controller.sendError(req, res, "Unauthorized", {statusCode:401});
  // DO NOT FORWARD TO NEXT!
}

/**
  Authorize this user.  Either return error or forward to next if successful.
*/ 
module.exports.currentUser = function adminUser(req, res, next) {
  // TODO: not implemented; forward to next method in chain
  next();
}