var fs = require('fs');
require('./awsauth.js');
var AWS = require('aws-sdk');
var REQUEST 		= require('request');


/**
  send stuff to aws for recording with entire folder path

  content: the json to be converted to voice and uploaded
  mp3FileName: the filename for each piece of content since we are converting into small pieces
  fileDir: is userhandle - automatically create subfolder by userhandle name
  finalFileName: after stitching the files into a single file
  fileCount: no of files to expect in the folder to detect when to stop looping
*/
function internalRecord(content, mp3FileName, fileDir, fileCount, finalFileName) 
{

// Import the built-in Node.js filesystem module

// Create a new AWS Polly object
var polly = new AWS.Polly();

var params = {
 OutputFormat: 'mp3',               // You can also specify pcm or ogg_vorbis formats.
 Text: content,     // This is where you'll specify whatever text you want to render.
 VoiceId: 'Raveena'                   // Specify the voice ID / name from the previous step.
};


var synthCallback = function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else 
  console.log(data); // successful response

fs.writeFile(mp3FileName, data.AudioStream, function (err) {
  if (err) { 
  console.log('An error occurred while writing the file.');
  console.log(err);
  }
  else
  {
     console.log('Finished writing the file to the filesystem');


       fs.readdir(fileDir, function(err, items) {
          console.log("checking if all files are done");
      
          if(items.length == fileCount)
          {
                 
                 console.log("recorded all the pieces. now stitching and uploading", finalFileName);
                 stitchAudio(fileDir, finalFileName);
                 
          }
      });  

  }

  });
  
};
// Call the synthesizeSpeech() API, with the user-defined parameters, and write the result to a file
polly.synthesizeSpeech(params, synthCallback);



}


/**
 * 
 * allows sticthing files into a single mp3
 * folder is userhandle
 * finalName is to be passed to s3 for upload
 */

function stitchAudio(folder, finalName)
{
    var fs = require('fs'),
    files = fs.readdirSync(folder),
    clips = [],
    stream,
    currentfile,
    dhh = fs.createWriteStream(finalName);

      // create an array with filenames (time)
      files.forEach(function (file) {
          clips.push(file);  
      });

      // Sort
      clips.sort(function (a, b) {
          return a - b;
      });

      main(clips,folder, dhh, finalName);
}

      // recursive function that will call until each file is sticthed
function main(clips, folder, dhh, finalName) 
{

          
          if (!clips.length) {
              dhh.end("Done");
              console.log("done. ready to upload");
              upload(finalName);
              return;
          }
          currentfile = "./"+folder+"/" + clips.shift();
          stream = fs.createReadStream(currentfile);
          stream.pipe(dhh, {end: false});
          stream.on("end", function() {
              
              main(clips, folder, dhh, finalName);        
          });
}


/**
 * 
 * upload to s3 and then make an entry into stamplay
 * derive userhandle from finalName
 */
function upload(finalName)
{

 console.log("uploading ot s3", finalName);

  var s3 = new AWS.S3({signatureVersion: 'v4'});
  var zlib     = require('zlib'),
    s3Stream = require('s3-upload-stream')(s3);

  
// Create the streams 
var read = fs.createReadStream(finalName);
//var compress = zlib.createGzip();
var upload = s3Stream.upload({
  "Bucket": "fdvids",
  "Key": finalName,
  "ACL":'public-read'
});
 
// Optional configuration 
upload.maxPartSize(20971520); // 20 MB 
upload.concurrentParts(5);
 
// Handle errors. 
upload.on('error', function (error) {
  console.log(error);
});
 

upload.on('part', function (details) {
  console.log(details);
});
 

upload.on('uploaded', function (details) {

  console.log("calling twitter with ", details);
  callTwitter(details, finalName)
  
});
 
// Pipe the incoming filestream through compression, and up to S3. 
//read.pipe(compress).pipe(upload);
read.pipe(upload);
}


function callTwitter(awsDetails, finalName)
{

  var awsUrl = awsDetails.Location;
  var nameArr = finalName.split("_");
  
  var requestData = {
    "handle": nameArr[0],
    "awsurl": awsUrl
  };

  console.log("tweeting with ", requestData);

  REQUEST({
		url: 'http://localhost:6000/twitter/sendNews',
		method: 'POST',
		json: true,
    headers: {
        "content-type": "application/json",
    },
    body: requestData
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending message: ==', error);
		} else {

      console.log("done");
    }
});

}


// ===== PUBLIC ======
module.exports.internalRecord = internalRecord;
module.exports.stitchAudio = stitchAudio;