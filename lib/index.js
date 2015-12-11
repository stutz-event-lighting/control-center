var WebSocket = require("ws");
var express = require("express");
var bp = require("body-parser");
var url = require("url");
var request = require("request");
var devices = require("./devices.js");
var cookieParser = require("cookie-parser")();
var getSession = require("boxify/lib/routes/sessions/get.js");
var ensure = require("boxify/lib/routes/sessions/ensure.js");

module.exports = function(boxify,config){
    new ControlCenter(boxify,config);
}

function ControlCenter(boxify,config){
    this.boxify = boxify;
    this.config = config;

    for(var device in devices){
        if(!devices[device].public) boxify.addPermission(device,devices[device].name)
    }

    boxify.addRoute("/electronic",require.resolve("./views/electronic.jade"));
    boxify.addRoute("/tablet-office",require.resolve("./views/tablet-office.jade"));
    boxify.addRoute("/tablet-stairs",require.resolve("./views/tablet-stairs.jade"));
    boxify.addRoute("/tablet-bistro",require.resolve("./views/tablet-bistro.jade"));
    boxify.addRoute("/tablet-outdoor",require.resolve("./views/tablet-outdoor.jade"));
    boxify.addRoute("/tictactoe",require.resolve("./views/tictactoe.jade"));

    boxify.app.post("/api/electronic/:device/:command",function(req,res){
        cookieParser(req,res,function(){
            if(devices[req.params.device] && devices[req.params.device].public) return pipe();
            ensure(boxify,req.cookies.session,req.params.device,function(err){
                if(err) return res.fail();
                pipe();
            })

            function pipe(){
                req.pipe(request.post({
                    url:"http://localhost:"+config.port+"/"+req.params.device+"/"+req.params.command,
                    headers:req.headers
                })).on("error",function(){}).pipe(res);
            }
        })
    }.bind(this));

    var wsserver = new WebSocket.Server({server:boxify.server});
    wsserver.on("connection",function(c){
        cookieParser(c.upgradeReq,null,function(){
            getSession(boxify,c.upgradeReq.cookies.session,function(err,session){
                if(err) return c.close();
                var con = new WebSocket("ws://localhost:"+config.port).on("open",function(){
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
            });
        });
    }.bind(this));
}
