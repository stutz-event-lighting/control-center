var sonos = require("sonos");
var Device = require("../device.js");

var AllOff = module.exports = function(button,lights,officelight){
    Device.call(this);
    this.lights = lights;
    this.officelight = officelight;
    button.on("change",function(){
        if(!button.value){
            this.off();
        }
    }.bind(this));
}

AllOff.prototype = Object.create(Device.prototype);

AllOff.prototype.off = function(){
    console.log("off");
    for(var i = 0; i < this.lights.length; i++){
        this.lights[i].set(false,function(){})
    }
    sonos.search(function(device){
        new sonos.Sonos(device.host).pause(function(){});
    });
    this.officelight.setSceneByName("Aus");
}
