/**
 * We're creating a remote cloud hosted advisor that will act as an external
 * monitoring agent.
 */
 
require('./ook');
var http = require('http');

var advisor = ook.Class();
advisor.prototype._construct = function()
{
  console.log('Server Starting');
  
  var server = function()
  {
      http.createServer(function (req, res) {
        console.log(req.url);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('ok\n');
    }).listen(process.env.C9_PORT, "0.0.0.0");
    console.log('Server running at http://service-monitor.dermidgen.cloud9ide.com');
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

