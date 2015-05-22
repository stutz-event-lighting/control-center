var Device = require("../device.js");

var WorkshopLight = module.exports = function WorkshopLight(relay){
    Device.call(this);
    this.relay = relay;
    this.set("on",this.relay.value);
    this.relay.on("change",function(){
        this.set("on",this.relay.value);
    }.bind(this));
}

WorkshopLight.prototype = Object.create(Device.prototype);

WorkshopLight.prototype.turnOn = function(cb){
    this.relay.set(true,cb);
}

WorkshopLight.prototype.turnOff = function(cb){
    this.relay.set(false,cb);
}
