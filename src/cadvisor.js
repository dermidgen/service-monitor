/**
 * We're creating a remote cloud hosted advisor that will act as an external
 * monitoring agent.
 */
 
var ook = require('./ook');
var http = require('http');

var advisor = ook.Class().mixin(ook.observable);
advisor.prototype._construct = function()
{
  console.log('Server Starting');
  
  var server = function()
  {
      http.createServer(function (req, res) {
        handleRequest(req, res);
    }).listen(process.env.C9_PORT, "0.0.0.0");
    console.log('Server running at http://service-monitor.dermidgen.cloud9ide.com');
  };
  
    var handleRequest = function(req, res)
    {
        console.log(req.url);
        respond(res);
    };
  
    var respond = function(res)
    {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ok\n');
    };
  
  server();
};

advisor.instance = null;
advisor.getInstance = function()
{
  if (!advisor.instance) advisor.instance = new advisor();
  return advisor.instance;
};

advisor.main = function()
{
    var app = advisor.getInstance();
};

advisor.main();