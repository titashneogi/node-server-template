var controller = require('./controller');

var recordUtils = require('../../lib/recordutils.js');
require('../../lib/awsauth.js');
var AWS = require('aws-sdk');
var fs = require('fs');
var REQUEST 		= require('request');




/**
 * 
 * ER news from backend
 */
function fetchJSON(req, res, next)
{

    
    var rsj = require('rsj');
 
      rsj.r2j('http://142.4.2.225/feedfiles1/ianseng.rss',function(json) 
      { 
        
        console.log(json);
       controller.sendNext(req, res, next, undefined, json); 
        
      });

    
}




/**
  Return a list of routes supported by this controller.  
  Map path to function (action)
*/
module.exports.routes = function routes() {
  return [
    {method:'get', path:'/rssJson/convert', action:fetchJSON, role:'guest'}
  ]
}