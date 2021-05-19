//@ts-check
const net = require('net');
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
      console.log('worker ' + worker.process.pid + ' died');
    });
  } else {
    const server = net.createServer();
    server.listen(port, host, () => {
        console.log('TCP Server is running on port ' + port + '.');
    });

    server.on('connection', (sock) => {
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', function(data) {
            console.log('DATA ' + sock.remoteAddress + ': ' + data);
        });

        sock.on('close', function(data) {

        });
        
    });
}


