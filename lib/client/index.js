var EventEmitter = require("events").EventEmitter;
var Device = require("./device.js");

var DeviceClient = module.exports = function DeviceClient(){
    EventEmitter.call(this);
    this.state = "disconnected";
    this.devices = {};
    this.lastTry = 0;
    this.connect();
}

DeviceClient.prototype = Object.create(EventEmitter.prototype);

DeviceClient.prototype.connect = function(){
    this.state = "connecting";
    this.lastTry = new Date().getTime();
    this.socket = new WebSocket("ws://"+location.host+"/api/electronic");
    this.socket.onopen = function(){
        this.emit("change");
    }.bind(this);
    this.socket.onmessage = function(msg){
        msg = JSON.parse(msg.data);
        console.log(msg);
        if(msg.type == "device"){
            this.devices[msg.name] = new Device(this.socket,msg.name,msg.commands,msg.state);
        }else if(msg.type == "end_devices"){
            this.state = "connected";
            this.emit("change");
        }else if(msg.type == "state"){
            this.devices[msg.name].updateState(msg.state);
            this.emit("change");
        }
    }.bind(this);
    this.socket.onclose = function(){
        this.state = "disconnected";
        this.emit("change");
    }.bind(this);
}

DeviceClient.prototype.disconnect = function(){
    if(this.state == "connected") this.socket.close();
}
