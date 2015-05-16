var async = require("async");
var Device = require("../device.js");
var OutdoorLight = module.exports = function MainLight(light){
    Device.call(this);
    this.light = light;
    this.light.on("change",this.detectState.bind(this));
    this.detectState();
}

OutdoorLight.prototype = Object.create(Device.prototype);

OutdoorLight.prototype.detectState = function(){
    this.set("status",this.light.value?"on":"off");
}

OutdoorLight.prototype.turnOff = function(cb){
    this.light.set(false,cb);
}

OutdoorLight.prototype.turnOn = function(cb){
    this.light.set(true,cb);
}
