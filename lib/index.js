var ws = require("ws");
var net = require("net");
var byline = require("byline");
var deviceProxy = require("./server/proxy.js");

module.exports = function(boxify,config){
    boxify.addRoute("/electronic",require.resolve("./views/electronic.jade"));
    boxify.addRoute("/tictactoe",require.resolve("./views/tictactoe.jade"));

    var wsserver = new ws.Server({server:boxify.server});
    wsserver.on("connection",function(c){
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
