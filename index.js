//@ts-check
const net = require('net');
const fs = require('fs/promises')
const port = 4321;
const host = '127.0.0.1';

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', function(worker, code, signal) {
      //console.log('worker ' + worker.process.pid + ' died');
    });
  } else {
    const server = net.createServer();
    server.listen(port, host, () => {
        //console.log('TCP Server is running on port ' + port + '.');
    });

    server.on('connection', (sock) => {
        //console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', async function(data) {
            let dataStr = data.toString();
            let tokenizedStr = dataStr.split(' ');
            let fileStr = '.' + tokenizedStr[1];

            let fileExists = true;
            
            let file = await fs.readFile(fileStr,'utf8')
            .catch((error) => {
                fileExists = false;
            });

            let statusLine = null;
            let contentTypeLine = null;
            let entityBody = null;

            if (fileExists) {

            } else {
                statusLine = '404 Not Found';
                entityBody = "<HTML>" +
                            "<HEAD><TITLE>Not Found</TITLE></HEAD>" +
                            "<BODY>Not Found</BODY></HTML>";

            }

            
            
        });

        sock.on('close', function(data) {

        });
        
    });
}


