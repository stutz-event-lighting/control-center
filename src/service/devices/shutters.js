var Device = require("../device.js");

class Shutters extends Device{
    constructor(up,down){
        this.up = up;
        this.down = down;
        this.timeout = null;
        this.set("status","stopped");
    }

    clear(){
        if(this.timeout){
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    async scheduleStop(time,cb){
        this.clear();
        return new Promise((s)=>{
            this.timeout = setTimeout(s,time);
        });
    }

    async stop(){
        this.clear();
        await Promise.all([
            this.up.set(false),
            this.down.set(false)
        ]);
        this.set("status","stopped");
    }

    async moveUp(){
        this.clear();
        await this.down.set(false);
        await this.up.set(true);
        this.set("status","movingup");
        this.scheduleStop(7000);
    }
    async moveDown(){
        this.clear();
        await this.up.set(false);
        await this.down.set(true);
        this.set("status","movingdown");
        this.scheduleStop(70000);
    }

    async tilt(){
        this.clear();
        await this.moveDown();
        (async function(){
            await this.scheduleStop(62*1000);
            await this.moveUp();
            await this.scheduleStop(1000);
        }).bind(this)();
    }
}

module.exports = Shutters;
