var Device = require("../device.js");
var checkDark = require("../checkDark.js");
var sleep = require("sleep.async");

class AllOff extends Device{
    constructor(button,mainlight,officelight,outdoorlight,lights,sonos,outerdoor,innerdoor){
        this.lights = lights;
        this.officelight = officelight;
        this.mainlight = mainlight;
        this.outdoorlight = outdoorlight;
        this.sonos = sonos;
        this.outerdoor = outerdoor;
        this.innerdoor = innerdoor;
        button.on("change",()=>{
            if(!button.value){
                this.off();
            }
        });
    }

    async off(){
        for(var i = 0; i < this.lights.length; i++){
            this.lights[i].set(false)
        }
        this.sonos.pause();
        this.officelight.setSceneByName("Aus");
        this.mainlight.turnOff();
        this.outerdoor.setAutoLock(true);
        this.innerdoor.setAutoLock(true);
        if(checkDark()){
            this.outdoorlight.turnOn();
            await sleep(3*60*1000);
            this.outdoorlight.turnOff();
        }
        this.outdoorlight.turnOff();
    }
}

module.exports = AllOff;
