var Device = require("../device.js");
var checkDark = require("../checkDark.js");

var AllOff = module.exports = function(button,mainlight,officelight,outdoorlight,lights,sonos){
    Device.call(this);
    this.lights = lights;
    this.officelight = officelight;
    this.mainlight = mainlight;
    this.outdoorlight = outdoorlight;
    this.sonos = sonos;
    button.on("change",function(){
        if(!button.value){
            this.off();
        }
    }.bind(this));
}

AllOff.prototype = Object.create(Device.prototype);

AllOff.prototype.off = function(){
    var dark = checkDark();
    for(var i = 0; i < this.lights.length; i++){
        this.lights[i].set(false,function(){})
    }
    this.sonos.pause(function(){});
    if(dark){
        this.officelight.setSceneByName("Go Home");
        if(this.mainlight.state.status=="on") this.mainlight.turnHalfOn(function(){});
        setTimeout(function(){
            this.officelight.setSceneByName("Aus");
            this.mainlight.turnOff(function(){});
        }.bind(this),30*1000)
        setTimeout(function(){
            this.outdoorlight.turnOff(function(){});
        }.bind(this),3*60*1000)
    }else{
        this.officelight.setSceneByName("Aus");
        this.mainlight.turnOff(function(){});
        this.outdoorlight.turnOff(function(){});
    }
}
