var Device = require("../device.js");
var checkDark = require("../checkDark.js");

var AllOff = module.exports = function(button,mainlight,officelight,outdoorlight,lights,sonos,outerdoor,innerdoor){
    Device.call(this);
    this.lights = lights;
    this.officelight = officelight;
    this.mainlight = mainlight;
    this.outdoorlight = outdoorlight;
    this.sonos = sonos;
    this.outerdoor = outerdoor;
    this.innerdoor = innerdoor;
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
    this.officelight.setSceneByName("Aus");
    this.mainlight.turnOff(function(){});
    this.outerdoor.setAutoLock(true,function(){});
    this.innerdoor.setAutoLock(true,function(){});
    if(dark){
        this.outdoorlight.turnOn(function(){});
        setTimeout(function(){
            this.outdoorlight.turnOff(function(){});
        }.bind(this),3*60*1000);
    }else{
        this.outdoorlight.turnOff(function(){});
    }
}

AllOff.prototype.phase2 = function(){
    this.outdoorlight.turnOff(function(){});
}
