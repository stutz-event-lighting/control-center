var http = require("http");
var express = require("express");
var bp = require("body-parser");
var ws = require("ws");
var async = require("async");
var byline = require("byline");
var url = require("url");
var suncalc = require("suncalc");
var fs = require("co-fs");
var path = require("path");
var co = require("co");

var HUT = require("./relais/hut.js");
var devices = require("../devices.js");
var checkDark = require("./checkDark.js");

// Devices
var AllOff = require("./devices/AllOff.js");
var Gate = require("./devices/Gate.js");
var MainLight = require("./devices/MainLight.js");
var OfficeLight = require("./devices/OfficeLight.js");
var Shutters = require("./devices/shutters.js");
var OutdoorLight = require("./devices/OutdoorLight.js");
var WorkshopLight = require("./devices/WorkshopLight.js");
var Sonos = require("./devices/Sonos.js");
var Door = require("./devices/Door.js");
var Bell = require("./devices/Bell.js");

var Controller = module.exports = function Controller(config){
    this.config = config;
    this.connections = [];
    this.devices = {};
    this.app = express();
    this.server = http.createServer(this.app);
    this.wsserver = new ws.Server({server:this.server}).on("connection",this.onConnection.bind(this));

    this.app.use("/public",express.static(path.resolve(__dirname,"../../public")));
    this.app.get("/:device",function(req,res){
        if(this.devices[req.params.device]){
            res.writeHead(200,"OK",{"Cotent-Type":"application/json"});
            res.end(JSON.stringify(this.devices[req.params.device].getState()));
        }else{
            res.writeHead(404,"Not found");
            res.end();
        }
    }.bind(this));
    this.app.post("/:device/:command",bp.json(),function(req,res){
        var device = this.devices[req.params.device];
        if(device && devices[req.params.device].commands.indexOf(req.params.command)>=0) device.call(req.params.command,req.body);
        res.end();
    }.bind(this));
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
        var r1 = this.relais1 = huts[0];
        var r2 = this.relais2 = huts[1];

        this.addDevice("mainlight",new MainLight(r1.ios[3],r1.relays[4],r1.relays[5]));
        this.addDevice("outdoorlight",new OutdoorLight(r2.relays[3]));
        this.addDevice("gate",new Gate(r1.ios[2],r2.ios[1],r2.ios[0],r1.relays[6],r1.relays[7],this.devices.mainlight,this.devices.outdoorlight));
        this.addDevice("outerdoor",new Door(r2.ios[2],r2.relays[4]));
        this.addDevice("innerdoor",new Door(r2.ios[3],r2.relays[5]));
        this.addDevice("officelight",new OfficeLight(this.config.hueuser));
        this.addDevice("sonos",new Sonos());
        this.addDevice("shutters",new Shutters(r2.relays[1],r2.relays[0]));
        this.addDevice("workshoplight",new WorkshopLight(r1.relays[0],r1.relays[1]));
        this.addDevice("alloff",new AllOff(r1.ios[4],this.devices.mainlight,this.devices.officelight,this.devices.outdoorlight,[r1.relays[0],r1.relays[1]],this.devices.sonos,this.devices.innerdoor,this.devices.outerdoor));
        this.addDevice("bell",new Bell(this.devices.outdoorlight,this.config.url));
        this.loadControllers().catch(function(err){console.log("could not load controllers!")});
        this.outdoorLightLED = r2.relays[2];
        setInterval(this.setOutdoorTabletLEDState.bind(this),60*1000);
        this.setOutdoorTabletLEDState();

        this.server.listen(this.config.port);
    }.bind(this));
}

Controller.prototype.addDevice = function(name,device){
    this.devices[name] = device;
    device.commands = devices[name].commands;
    device.on("change",function(){
        var states = {};
        states[name] = device.getState();
        for(var i = 0; i < this.connections.length; i++){
            this.connections[i].send(JSON.stringify(states));
        }
    }.bind(this));
}

Controller.prototype.loadControllers = co.wrap(function*(){
    var controllers = yield fs.readdir(path.resolve(__dirname,"./controllers"));
    for(var i = 0; i < controllers.length; i++){
        require("./controllers/"+controllers[i])(this);
    }
});

Controller.prototype.onConnection = function(c){
    var params = url.parse(c.upgradeReq.url,true).query;
    this.connections.push(c);
    c.on("close",function(){
        this.connections.splice(this.connections.indexOf(c),1);
    }.bind(this));
    c.on("error",function(){})
    var states = {};
    for(var device in this.devices){
        states[device] = this.devices[device].getState();
    }
    c.send(JSON.stringify(states));
}

Controller.prototype.setOutdoorTabletLEDState = function(){
    var on = checkDark(1,5);
    this.outdoorLightLED.set(on,function(){})
    if(!on) this.devices.outdoorlight.turnOff(function(){});
}
