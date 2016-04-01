var WebSocket = require("ws");
var express = require("express");
var bp = require("body-parser");
var url = require("url");
var request = require("request");
var devices = require("./devices.js");
var cookieParser = require("cookie-parser")();
var getSession = require("boxify/lib/routes/sessions/get.js");
var ensure = require("boxify/lib/routes/sessions/ensure.js");
var path = require("path");
var wrap = require("co-express");
var co = require("co");
var async = require("async");
var updateTablet = require("./updateTablet.js");

module.exports = function(boxify,config){
    return new ControlCenter(boxify,config);
}

function ControlCenter(boxify,config){
    this.boxify = boxify;
    this.config = config;

    for(var device in devices){
        if(!devices[device].public) boxify.addPermission(device,devices[device].name)
    }
    boxify.addRoute("/electronic",require.resolve("./views/electronic.jade"));
    boxify.addRoute("/pins",require.resolve("./views/pins.jade"));
    boxify.addRoute("/tablet-office",require.resolve("./views/tablet-office.jade"));
    boxify.addRoute("/tablet-stairs",require.resolve("./views/tablet-stairs.jade"));
    boxify.addRoute("/tablet-bistro",require.resolve("./views/tablet-bistro.jade"));
    boxify.addRoute("/tablet-outdoor",require.resolve("./views/tablet-outdoor.jade"));
    boxify.addRoute("/tictactoe",require.resolve("./views/tictactoe.jade"));

    boxify.app.post("/api/pins/create",require("./routes/pins/create.js"));
    boxify.app.post("/api/pins",require("./routes/pins/search.js"));
    boxify.app.post("/api/pins/login",require("./routes/pins/login.js"));
    boxify.app.post("/api/pins/:pin/update",require("./routes/pins/update.js"));
    boxify.app.get("/api/pins/:pin/delete",require("./routes/pins/delete.js"));


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

ControlCenter.prototype.loadModels = function(){
    if(this.boxify.db.Pin) return;
    require("./models")(this.boxify.db);
}

ControlCenter.prototype.start = co.wrap(function*(){
    this.loadModels();
    setTimeout(()=>{
        for(var ip in this.config.tablets){
            updateTablet(ip,this.boxify.config.url+this.config.tablets[ip]);
        }
    },1000);

});

ControlCenter.prototype.beforeUpdate = co.wrap(function*(version){
    this.loadModels();
    var db = this.boxify.db;
    if(version == "0.2.0"){
        yield new Promise(function(success,fail){
            db.collection("contacts").find({pin:{$exists:true}},{_id:true,pin:true}).toArray(function(err,contacts){
                if(err) return fail(err);
                async.each(contacts,function(contact,cb){
                    db.collection("pins").insert({_id:contact._id,pin:contact.pin,rules:[{}]},cb)
                },function(err){
                    if(err) return fail(err);
                    success();
                })
            })
        })
    }
});
