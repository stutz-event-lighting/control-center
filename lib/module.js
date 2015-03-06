var ws = require("ws");
var net = require("net");
var byline = require("byline");
var deviceProxy = require("./server/proxy.js");

var BoxifyModule = module.exports = function BoxifyModule(config){
    this.config = config;
    this.boxify = config.boxify;
    this.boxify.addRoute("/electronic",require.resolve("./views/electronic.jade"));

    this.wsserver = new ws.Server({server:this.boxify.server});
    this.wsserver.on("connection",function(c){
        switch(c.upgradeReq.url){
            case "/api/electronic":
                deviceProxy(config,c);
                break;
            default:
                c.close();
                break;
        }
    });
}
