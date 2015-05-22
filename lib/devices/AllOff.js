var Device = require("../device.js");

var AllOff = module.exports = function(button,lights,officelight,sonos){
    Device.call(this);
    this.lights = lights;
    this.officelight = officelight;
    this.sonos = sonos;
    button.on("change",function(){
        if(!button.value){
            this.off();
        }
    }.bind(this));
}

AllOff.prototype = Object.create(Device.prototype);

AllOff.prototype.off = function(){
    for(var i = 0; i < this.lights.length; i++){
        this.lights[i].set(false,function(){})
    }
    this.sonos.pause(function(){});
    this.officelight.setSceneByName("Aus");
}
