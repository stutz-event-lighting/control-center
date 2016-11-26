var router = require("koa-router")();
var devices = require("../../../devices.js");
var getSession = require("require")("boxify/lib/api/sessions/get.js");
var ensure = require("require")("boxify/lib/api/sessions/ensure.js");
var request = require("request");
var WebSocket = require("ws");

module.exports = router
	.post("/:device/:command",async function(ctx){
		if(!devices[ctx.params.device] || !devices[ctx.params.device].public){
			await ensure(ctx.app.db,ctx.cookies.get("session"),ctx.params.device);
		}
		ctx.body = ctx.body = request.post({
			url:"http://localhost:"+ctx.app.controlCenter.config.port+"/"+ctx.params.device+"/"+ctx.params.command,
			headers:ctx.headers
		});
	})
	.get("",async function(ctx){
		var session = (await getSession(ctx.app.db,ctx.cookies.get("session")))||{permissions:[]};
		var c = await ctx.upgrade();
		var con = new WebSocket("ws://localhost:"+ctx.app.controlCenter.config.port+"/").on("open",function(){
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
		ctx.respond = false;
	})
	.middleware();
