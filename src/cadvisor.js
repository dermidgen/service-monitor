/**
 * We're creating a remote cloud hosted advisor that will act as an external
 * monitoring agent.
 */
 
var ook = require('./ook');
var http = require('http');
var sys = require('util');
var exec = require('child_process').exec;
var nodemailer = require('nodemailer');
var fs = require('fs');

advisor = ook.Class().mixin(ook.observable);
advisor.prototype._construct = function()
{
  console.log('Server Starting');
  var self = this;
  
  var server = function()
  {
      http.createServer(function (req, res) {
        handleRequest(req, res);
    }).listen(5200, "0.0.0.0");
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
    
    var alert = function(message)
    {
		nodemailer.sendmail = true;

		console.log('ALERT');

	    // send an e-mail
	    nodemailer.send_mail(
	        // e-mail options
	        {
	            sender: 'good.midget@nsiautostore.com',
	            to:'good.midget@gmail.com',
	            subject:'Service Monitor Alert!',
	            html: '<p><b>ALERT:</b> a service has failed</p><br/><pre>' + message + '</pre>',
	            body:'ALERT: A service has failed!' + "\n\n" + message
	        },
	        // callback function
	        function(error, success){
	            console.log('Message ' + success ? 'sent' : 'failed');
			}
		);	
	};

	this.registerAgent = function(agent)
	{
		var l = {
			result: function(e){
				self.dispatch({type:'result',agent:agent,result:e.result});
			}
		};
		agent.addListener('result',l.result);
		agent.run();
	};

	this.loadConfig = function(filename)
	{
		console.log('Loading Config: '+filename);
		require('./run/'+filename);
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
	PING: 0x002,
	CURL: 0x003,
	FTP:  0x004
};
advisor.agent.prototype._construct = function(opts)
{
	this.name = null;
	this.type = null;
	this.uri = null;
	
	var freq = 60000;
	var self = this;

	var taskOptions = opts;
	
	var tasks = {
		http: function(uri,opts) {
			if (!opts) opts = {};
			
			http.get({
				host: self.uri.host,
				port: self.uri.port,
				path: self.uri.path
				},
				function(res){
					var success = (res.statusCode == 200) ? true : false;
					self.dispatch({
						type: 'result',
						agent: self,
						opts: opts,
						success: success,
						result: res.statusCode
				});		
			});	
		},
		curl: function(uri,opts) {
			var args = taskOptions.args || "";
			var cmd = "curl \""+uri+"\" -s --head "+args;
			exec(cmd,function(err, stdout, stderr) {
				var success = taskOptions.parseResult(stdout) || false;
				self.dispatch({
					type: 'result',
					agent: self,
					opts: taskOptions,
					success: success,
					result: stdout
				});
			});
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

		var task = function() {};
		var interval = opts.freq || freq;

		switch(this.type)
		{
			case advisor.agent.type.HTTP:
				task = function() { tasks.http(opts.uri || self.uri, opts); };
			break;
			case advisor.agent.type.PING:
				task = function() { tasks.ping(opts.uri || self.uri, opts);	};
			break;
			case advisor.agent.type.CURL:
				task = function() { tasks.curl(opts.uri || self.uri, opts); };
			break;
			default:
				throw new Error('Agent type out of range.');
		}
		if (interval > 0) setInterval(task, interval);
		else task();
	};
	
	setopts(opts || {});
};

advisor.main = function()
{
	var app = advisor.getInstance();
	app.loadConfig('default.js');
	app.loadConfig('custom.js');
};

advisor.main();