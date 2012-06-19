var srv = require('./app/server');
var Server =  new srv.Server();
module.exports.Server = Server;

// ===== Command Line =============================================================================

var port = 3000;
var usage = ''
  + 'Usage: app.js [options]'
  + '\n'
  + '\nOptions:'
  + '\n  -p, --port NUM       Port number for server, default is ' + port.toString()
  + '\n  -r, --routes         Display routes'
  + '\n  -h, --help           Display help information'
  + '\n';

// Parse arguments
var args = process.argv.slice(2);
var printRoutes = false;

while (args.length) {
  var arg = args.shift();
  switch (arg) {
    case '-h':
    case '--help':
      console.error(usage + '\n');
      process.exit(1);
      break;
    case '-p':
    case '--port':
      if (arg = args.shift()) {
        port = parseInt(arg, 10);
      } else {
        throw new Error('--port requires a number');
      }
      break;
    case '-r':
    case '--routes':
      printRoutes = true;
      break;
    default:
      break;
  }
}

// print routes if requested
if (printRoutes) {
  console.log("ROUTES:\n" + Server.routes.join("\n") + "\n");
}

// Last safety net
process.on('uncaughtException', function(error) {
  var errorMessage = "UNCAUGHT EXCEPTION: " + (error.stack ? error.stack : error);
  Server.shutdown(errorMessage);
});

// initialize and start server
Server.init(function(err) {
  if (err) {
    console.log(err);
  } else {
    Server.start({port:port});
  }
});

