/**
 * We're creating a remote cloud hosted advisor that will act as an external
 * monitoring agent.
 */
 
//var ook = require('ook.js');

var http = require('http');

http.createServer(function (req, res) {
    console.log(req.url);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('ok\n');
}).listen(process.env.C9_PORT, "0.0.0.0");
console.log('Server running at http://service-monitor.dermidgen.cloud9ide.com');