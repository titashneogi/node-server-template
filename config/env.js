/**
  Point to current environment/config values
*/
var env = process.env.NODE_ENV || 'development';
module.exports.current = require('./'+env).config;