var controller = require('./controller');
require('../../lib/awsauth.js');
var AWS = require('aws-sdk');
var fs = require('fs');
var REQUEST 		= require('request');

var Stamplay = require('stamplay')
var stamplay = new Stamplay('akashvani', '96db036cd7b565904e0dfc9aa9c0348efe61cc173a5e631f2fbf43af44a2cd83');

var urlencode = require('urlencode');



/**
  send stuff to aws for recording
*/
function record(req, res, next) {

  
  var content = urlencode.decode(req.body.content);
  var userHandle = req.body.handle;
  var topic = req.body.topic;
  

  console.log("here",content);
// Import the built-in Node.js filesystem module

// Create a new AWS Polly object
var polly = new AWS.Polly();

var params = {
 OutputFormat: 'mp3',               // You can also specify pcm or ogg_vorbis formats.
 Text: content,     // This is where you'll specify whatever text you want to render.
 VoiceId: 'Raveena'                   // Specify the voice ID / name from the previous step.
};

var mp3Filename = userHandle+topic+'.mp3';

var synthCallback = function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(data); // successful response

fs.writeFile(mp3Filename, data.AudioStream, function (err) {
  if (err) { 
  console.log('An error occurred while writing the file.');
  console.log(err);
  controller.sendNext(req, res, next, undefined, {status:error});
  }
  console.log('Finished writing the file to the filesystem');
  upload("./"+mp3Filename, mp3Filename, userHandle);
  controller.sendNext(req, res, next, undefined, {status:true});
  });
  
};
// Call the synthesizeSpeech() API, with the user-defined parameters, and write the result to a file
polly.synthesizeSpeech(params, synthCallback);

}

/**
 * 
 * ER news from backend
 */
function fetchNews(req, res, next)
{

    var userHandle = req.body.handle;
    var topic = req.body.topic;

    var erBaseUrl  = "http://c813255f.ngrok.io/events?location=India&keyword="+topic;
	  var erNewsData = [];

	REQUEST({
		url: erBaseUrl,
		method: 'GET',
		json: true
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending message: ==', error);
			cb();
		} else {
			
		  var jsonRes = body;
      var newsCast = "News on "+topic;

		//for (var i=0;i<jsonRes.length;i++)
    for (var i=0;i<1;i++) 
     {
		
      var summary =  urlencode(jsonRes[i].title+jsonRes[i].summary);
     
      newsCast = newsCast + summary;
			
    };
      
    console.log("saving to stamplay data now ",newsCast);
    var completePacket = 
      {
            "news": newsCast,
            "userhandle": userHandle
      };

       /**
           * 
           * save the data to stamplay which will trigger a 
           * fetchnews api call from popinjay
           */
         stamplay.Object('newscast').save(completePacket, function(error, result)
         {
                if(!error)
                {
                    //send response here
                    console.log("news saved in stamplay");
                    controller.sendNext(req, res, next, undefined, {status:true});
                }
                else
                {
                  console.log(error);
                  controller.sendNext(req, res, next, undefined, {status:false});
                }
           });

		}
	});

}


function upload(pathToAudio, fileName, userHandle)
{

  var s3 = new AWS.S3({signatureVersion: 'v4'});
  var zlib     = require('zlib'),
    s3Stream = require('s3-upload-stream')(s3);

  
// Create the streams 
var read = fs.createReadStream(pathToAudio);
//var compress = zlib.createGzip();
var upload = s3Stream.upload({
  "Bucket": "fdvids",
  "Key": fileName,
  "ACL":'public-read'
});
 
// Optional configuration 
upload.maxPartSize(20971520); // 20 MB 
upload.concurrentParts(5);
 
// Handle errors. 
upload.on('error', function (error) {
  console.log(error);
});
 
/* Handle progress. Example details object:
   { ETag: '"f9ef956c83756a80ad62f54ae5e7d34b"',
     PartNumber: 5,
     receivedSize: 29671068,
     uploadedSize: 29671068 }
*/
upload.on('part', function (details) {
  console.log(details);
});
 
/* Handle upload completion. Example details object:
   { Location: 'https://bucketName.s3.amazonaws.com/filename.ext',
     Bucket: 'bucketName',
     Key: 'filename.ext',
     ETag: '"bf2acbedf84207d696c8da7dbb205b9f-5"' }
*/
upload.on('uploaded', function (details) {
  console.log(details);
});
 
// Pipe the incoming filestream through compression, and up to S3. 
//read.pipe(compress).pipe(upload);
read.pipe(upload);
}


/**
  Return a list of routes supported by this controller.  
  Map path to function (action)
*/
module.exports.routes = function routes() {
  return [
    {method:'post', path:'/popinjay/record', action:record, role:'guest'},
    {method:'post', path:'/popinjay/fetchnews', action:fetchNews, role:'guest'}
  ]
}