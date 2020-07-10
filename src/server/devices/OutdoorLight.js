var async = require("async");
var Device = require("../device.js");
class OutdoorLight extends Device{
    constructor(light){
        super();
        this.light = light;
        this.light.on("change",this.detectState.bind(this));
        this.detectState();
    }

    detectState(){
        this.set("status",this.light.value?"on":"off");
    }

    async turnOff(){
        await this.light.set(false);
    }

    async turnOn(){
        await this.light.set(true);
    }
}
module.exports = OutdoorLight;
