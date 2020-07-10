var Device = require("../device.js");
var sleep = require("sleep.async");

class Door extends Device{
    constructor(io,relay){
        super();
        this.io = io;
        this.relay = relay;
        this.autoLock = true;

        this.set("open",!this.io.value);
        this.set("locked",!this.relay.value);

        this.io.on("change",()=>{
            this.set("open",!this.io.value);
            this.checkLock();
        });

        this.relay.on("change",()=>{
            this.set("locked",!this.relay.value);
        });

        this.checkLock(function(){})
    }
    async setLocked(locked){
        await this.relay.set(!locked);
        if(!locked && this.autoLock){
            sleep(30*1000).then(()=>{
                this.checkLock();
            });
        }
    }

    async setAutoLock(autolock){
        this.autoLock = autolock;
        await this.checkLock();
    }

    async checkLock(){
        if(!this.state.locked && this.autoLock){
            await this.setLocked(true);
        }else if(this.state.locked && !this.autoLock){
            await this.setLocked(false);
        }
    }
}

module.exports = Door;
