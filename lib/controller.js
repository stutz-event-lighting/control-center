var http = require("http");
var express = require("express");
var bp = require("body-parser");
var ws = require("ws");
var async = require("async");
var byline = require("byline");
var url = require("url");

var HUT = require("./relais/hut.js");
var Tablet = require("./tablet.js");
var devices = require("./devices.js");

// Devices
var AllOff = require("./devices/AllOff.js");
var Gate = require("./devices/Gate.js");
var MainLight = require("./devices/MainLight.js");
var OfficeLight = require("./devices/OfficeLight.js");
var Shutters = require("./devices/shutters.js");
var TicTacToe = require("./devices/TicTacToe.js");
var OutdoorLight = require("./devices/OutdoorLight.js");
var WorkshopLight = require("./devices/WorkshopLight.js");
var Sonos = require("./devices/Sonos.js");

var Controller = module.exports = function Controller(config){
    this.config = config;
    this.connections = [];
    this.devices = {};
    this.app = express();
    this.server = http.createServer(this.app);
    this.wsserver = new ws.Server({server:this.server}).on("connection",this.onConnection.bind(this));

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
        this.addDevice("gate",new Gate(r1.ios[2],r2.ios[1],r2.ios[0],r1.relays[6],r1.relays[7],this.devices.mainlight));
        this.addDevice("officelight",new OfficeLight(this.config.hueuser));
        this.addDevice("sonos",new Sonos());
        this.addDevice("alloff",new AllOff(r1.ios[4],[r1.relays[0],r1.relays[1],r1.relays[4],r1.relays[5]],this.devices.officelight,this.devices.sonos));
        this.addDevice("shutters",new Shutters(r2.relays[1],r2.relays[0]));
        this.addDevice("tictactoe",new TicTacToe(this.config.hueuser,this.devices.officelight));
        this.addDevice("outdoorlight",new OutdoorLight(r2.relays[3]));
        this.addDevice("workshoplight",new WorkshopLight(r1.relays[0]));

        this.officetablet = new Tablet("192.168.1.205","http://"+this.config.boxifyurl+"/tablet-bistro");
        this.stairstablet = new Tablet("192.168.1.207","http://"+this.config.boxifyurl+"/tablet-office");
        this.bistrotablet = new Tablet("192.168.1.208","http://"+this.config.boxifyurl+"/tablet-stairs");
        this.outdoortablet = new Tablet("192.168.1.206","http://"+this.config.boxifyurl+"/tablet-outdoor");

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
