var Device = require("../device.js");

class WorkshopLight extends Device{
    constructor(relay,relay2){
        super();
        this.relay = relay;
        this.relay2 = relay2;
        this.relay.on("change",this.updateState.bind(this));
        this.relay2.on("change",this.updateState.bind(this));
        this.updateState();
    }

    updateState(){
        this.set("on",this.relay.value || this.relay2.value);
    }

    async turnOn(){
        await this.relay.set(true);
    }

    async turnOff(){
        await Promise.all([
            this.relay.set(false),
            this.relay2.set(false)
        ]);
    }
}

module.exports = WorkshopLight;
