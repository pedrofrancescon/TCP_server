//@ts-check
const net = require('net');
const fs = require('fs').promises
const port = 50000;
const host = '127.0.0.1';
const CRLF = "\r\n";

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

const mime = require('mime-types');

let sockets = [];

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', function(worker, code, signal) {
      //console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    const server = net.createServer();
    server.listen(port, host, () => {
        console.log('TCP Server is running on port ' + port + '.');
    });

    server.on('connection', (sock) => {
        sockets.push(sock);
		
		sock.on('data', async function(data) {
			let dataStr = data.toString();
            let tokenizedStr = dataStr.split(' ');
            let fileStr = '.' + tokenizedStr[1];

            let fileExists = true;
			let file = null;
            
            await fs.readFile(fileStr)
            .then((data) => {
				file = data;
			})
			.catch((error) => {
				fileExists = false;
            });

            let statusLine = null;
            let contentTypeLine = null;
            let entityBody = null;

            if (fileExists) {
              	statusLine = 'HTTP/1.0 200 OK' + CRLF;
				contentTypeLine = 'Content-Type: ' + mime.lookup(fileStr) + CRLF; 
            } else {
                statusLine = 'HTTP/1.0 404 Not Found' + CRLF;
                contentTypeLine = 'Content-Type: ' + 'text/html' + CRLF;
                let failFile = await fs.readFile('./fail.html', 'utf8')
                entityBody = failFile;
            }
			
			sock.write(statusLine);
			sock.write(contentTypeLine);
			sock.write(CRLF);
            
			if (fileExists) {
				sock.write(file);
			} else {
				sock.write(entityBody);
			}
            
        });

        sock.on('close', function(data) {
			//console.log('Socket closed!')
        });

		sock.on('error', function(err) {
			//console.log(err)
        });
        
    });
}


