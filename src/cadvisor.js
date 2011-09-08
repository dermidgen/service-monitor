/**
 * We're creating a remote cloud hosted advisor that will act as an external
 * monitoring agent.
 */
 
var ook = require('./ook');
var http = require('http');
var sys = require('sys');
var exec = require('child_process').exec;

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

	this.registerAgent = function(agent)
	{
		var l = {
			result: function(e){
				console.log(e.agent.name + " - " + e.type + " - " + e.result);
			}
		};
		agent.addListener('result',l.result);
		agent.run();
	};

  server();
};

advisor.instance = null;
advisor.getInstance = function()
{
  if (!advisor.instance) advisor.instance = new advisor();
  return advisor.instance;
};

advisor.agent = ook.Class().mixin(ook.observable);
advisor.agent.type = {
	HTTP: 0x001,
	PING: 0x002
};
advisor.agent.prototype._construct = function(opts)
{
	this.name = null;
	this.type = null;
	this.uri = null;
	
	var freq = 60000;
	var self = this;
	
	var tasks = {
		http: function(uri,opts) {
			if (!opts) opts = {};
			
			setInterval(function(){
				http.get({
					host: self.uri.host,
					port: self.uri.port,
					path: self.uri.path
					},
					function(res){
						self.dispatch({
							type: 'result',
							agent: self,
							opts: opts,
							result: res.statusCode
						});		
					});
				}, opts.freq || freq);
				
		},
		ping: function(uri,opts) {			
			if (!opts) opts = {};
			exec("ping -c 3 localhost",function(err, stdout, stderr) {
				self.dispatch({
					type: 'result',
					agent: self,
					opts: opts,
					result: err
				});
			});
		}
	};
	
	var setopts = function(opts)
	{
		self.name = opts.name || 'agent'+Math.random();
		self.type = opts.type || null;
		self.uri = opts.uri || null;
		freq = opts.freq || 60000;
	};
	
	this.run = function(opts)
	{
		if (!opts) opts = {};
		
		if (!this.type) throw new Error('Agent type not specified');
		switch(this.type)
		{
			case advisor.agent.type.HTTP:
				tasks.http(opts.uri || this.uri, opts);
			break;
			case advisor.agent.type.PING:
				tasks.ping(opts.uri || this.uri, opts);
			break;
			default:
				throw new Error('Agent type out of range.');
		}
	};
	
	setopts(opts || {});
};

advisor.main = function()
{
    var app = advisor.getInstance();
    var www = new advisor.agent({
		type: advisor.agent.type.HTTP,
		name: "primary www check",
		uri: {
			host: "www.nsiautostore.com",
			port: 80,
			path: "/"
		},
		freq: 10000
    });
    var dnn = new advisor.agent({
		type: advisor.agent.type.HTTP,
		name: "dnn www check",
		uri: {
			host: "74.208.44.64",
			port: 80,
			path: "/"
		},
		freq: 2000
    });

	var ping = new advisor.agent({
		type: advisor.agent.type.HTTP,
		name: "primary ping check",
		uri: "nsiautostore.com",
		freq: 3
    });

	// Can't run ping on cloud9 - security
	//app.registerAgent(ping);
	
	app.registerAgent(www);
	app.registerAgent(dnn);
};

advisor.main();