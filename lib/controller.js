var net = require("net");
var async = require("async");
var HUT = require("./relais/hut.js");
var MainLight = require("./devices/MainLight.js");
var Gate = require("./devices/Gate.js");
var AllOff = require("./devices/AllOff.js");
var Shutters = require("./devices/shutters.js");
var DeviceServer = require("./server/index.js");

var Controller = module.exports = function Controller(config){
    this.config = config;
    this.connections = [];
}

Controller.prototype.start = function(){
    var self = this;
    async.parallel([
        function(cb){
            var relais = new HUT("192.168.1.201",75,"admin","anel");
            relais.initialize(function(){
                cb(null,relais)
            });
        },
        function(cb){
            var relais = new HUT("192.168.1.202",76,"admin","anel");
            relais.initialize(function(){
                cb(null,relais)
            });
        }
    ],function(err,huts){
        if(err) throw err;
        var r1 = self.relais1 = huts[0];
        var r2 = self.relais2 = huts[1];

        self.mainlight = new MainLight(r1.ios[3],r1.relays[4],r1.relays[5]);
        self.gate = new Gate(r1.ios[2],r2.ios[1],r2.ios[0],r1.relays[6],r1.relays[7]);
        self.alloff = new AllOff(r1.ios[4],[r1.relays[0],r1.relays[1],r1.relays[4],r1.relays[5]]);
        self.shutters = new Shutters(r2.relays[1],r2.relays[0]);

        var server = new DeviceServer(self.config);
        server.add("shutters",self.shutters);
        server.add("mainlight",self.mainlight);
        server.add("gate",self.gate);
    });
}
