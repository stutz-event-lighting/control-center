var EventEmitter = require("events").EventEmitter;
var Device = require("./device.js");
var devices = require("../devices.js");

var DeviceClient = module.exports = function DeviceClient(){
    EventEmitter.call(this);
    this.state = "disconnected";
    this.devices = {};
    for(var device in devices){
        this.devices[device] = new Device(device);
    }
    this.autoreconnect = false;
}

DeviceClient.prototype = Object.create(EventEmitter.prototype);

DeviceClient.prototype.listen = function(){
    clearTimeout(this.timeout);
    this.autoreconnect = true;
    this.state = "connecting";
    this.socket = new WebSocket("ws://"+location.host+"/api/electronic");
    this.emit("change");

    this.socket.onopen = function(){
        this.state = "connected";
        this.emit("change");
    }.bind(this);
    this.socket.onmessage = function(msg){
        var states = JSON.parse(msg.data);
        for(var device in states) this.devices[device].updateState(states[device]);
        this.emit("change");
    }.bind(this);
    this.socket.onclose = function(){
        this.state = "disconnected";
        this.timeUntilReconnect = 5;
        this.emit("change");
        if(this.autoreconnect) setTimeout(this.countDownReconnect.bind(this),1000);
    }.bind(this);
}

DeviceClient.prototype.countDownReconnect = function(){
    this.timeUntilReconnect--;
    if(this.timeUntilReconnect <= 0){
        delete this.timeUntilReconnect;
        this.listen();
    }else{
        this.emit("change");
        setTimeout(this.countDownReconnect.bind(this),1000);
    }
}

DeviceClient.prototype.disconnect = function(){
    this.autoreconnect = false;
    if(this.state != "disconnected") this.socket.close();
}
