var Device = require("../device.js");
var async = require("async");

var WorkshopLight = module.exports = function WorkshopLight(relay,relay2){
    Device.call(this);
    this.relay = relay;
    this.relay2 = relay2;
    this.relay.on("change",this.updateState.bind(this));
    this.relay2.on("change",this.updateState.bind(this));
    this.updateState();
}

WorkshopLight.prototype = Object.create(Device.prototype);

WorkshopLight.prototype.updateState = function(){
    this.set("on",this.relay.value || this.relay2.value);
}

WorkshopLight.prototype.turnOn = function(cb){
    this.relay.set(true,cb);
}

WorkshopLight.prototype.turnOff = function(cb){
    async.parallel([
        function(cb){
            this.relay.set(false,cb);
        }.bind(this),
        function(cb){
            this.relay2.set(false,cb);
        }.bind(this)
    ],cb);
}
