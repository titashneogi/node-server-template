/**
 * 
 * controls everything related to twitter listening and tweeting back
 */

var controller = require('./controller');



var  
    twit = require('twit'),
    config = require('../../lib/twitterConfig');

var Twitter = new twit(config);

//var Stamplay = require('stamplay')
//var stamplay = new Stamplay('akashvani', '96db036cd7b565904e0dfc9aa9c0348efe61cc173a5e631f2fbf43af44a2cd83')



/**
 * 
 * tweet back to user
 */
function tweetToUser(req, res, next)
{

   
    var userHandle = req.body.handle;
    var awsUrl = req.body.awsurl;
    //var newsTopic = req.params.topicl

    console.log("tweeting to ",awsUrl);

    var statusMsg = "@"+userHandle+" your audio news is ready. The url is "+awsUrl;
    // Tell TWITTER to retweet
    Twitter.post('statuses/update', {
        status:statusMsg
    }, function(err, response) {
        if (response) {
            console.log('messaged!!!');
        }
        // if there was an error while tweeting
        if (err) {
            console.log('Something went wrong while tweeting... Duplication maybe...');
        }
    });

    
}




/**
  Return a list of routes supported by this controller.  
  Map path to function (action)
*/
module.exports.routes = function routes() {
  return [
    {method:'post', path:'/twitter/sendNews', action:tweetToUser, role:'guest'}
  ]
}