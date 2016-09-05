var router = require("koa-router")();
var devices = require("../../../devices.js");
var getSession = require("require")("boxify/lib/api/sessions/get.js");
var ensure = require("require")("boxify/lib/api/sessions/ensure.js");
var request = require("request");
var WebSocket = require("ws");

module.exports = router
	.post("/:device/:command",function*(){
		if(!devices[this.params.device] || !devices[this.params.device].public){
			yield ensure(this.app.db,this.cookies.get("session"),this.params.device);
		}
		this.body = this.req.pipe(request.post({
			url:"http://localhost:"+this.app.controlCenter.config.port+"/"+this.params.device+"/"+this.params.command,
			headers:this.headers
		}))
	})
	.get("",function*(){
		var session = (yield getSession(this.app.db,this.cookies.get("session")))||{permissions:[]};
		var c = yield this.upgrade();
		var con = new WebSocket("ws://localhost:"+this.app.controlCenter.config.port+"/").on("open",function(){
			con.on("message",function(msg){
				msg = JSON.parse(msg);
				for(var device in msg){
					if(!devices[device].public && session.permissions.indexOf(device) < 0) delete msg[device];
				}
				c.send(JSON.stringify(msg));
			});
		})
		con.on("error",function(){c.close()})
		con.on("close",function(){c.close()});
		c.on("error",function(){con.close()});
		c.on("close",function(){con.close()});
		this.respond = false;
	})
	.middleware();
