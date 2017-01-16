var EventEmitter = require("events").EventEmitter;
var Device = require("./device");
var devices = require("../../../devices");

class DeviceClient extends EventEmitter{
    constructor(){
        super();
        this.state = "disconnected";
        this.devices = {};
        for(var device in devices){
            this.devices[device] = new Device(device);
        }
        this.autoreconnect = false;
    }

    listen(){
        clearTimeout(this.timeout);
        this.autoreconnect = true;
        this.state = "connecting";
        delete this.timeUntilReconnect;
        this.socket = new WebSocket("ws://"+location.host+"/api/electronic");
        this.emit("change");

        this.socket.onopen = ()=>{
            this.state = "connected";
            this.emit("change");
        }
        this.socket.onmessage = (msg)=>{
            var states = JSON.parse(msg.data);
            for(var device in states) this.devices[device].updateState(states[device]);
            this.emit("change");
        }
        this.socket.onclose = ()=>{
            this.state = "disconnected";
            this.timeUntilReconnect = 5;
            this.emit("change");
            if(this.autoreconnect) setTimeout(this.countDownReconnect.bind(this),1000);
        }
    }

    countDownReconnect(){
        this.timeUntilReconnect--;
        if(this.timeUntilReconnect <= 0){
            this.listen();
        }else{
            this.emit("change");
            setTimeout(this.countDownReconnect.bind(this),1000);
        }
    }

    disconnect(){
        this.autoreconnect = false;
        if(this.state != "disconnected") this.socket.close();
    }
}

module.exports = DeviceClient;
