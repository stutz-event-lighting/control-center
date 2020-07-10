var Device = require("../device.js");
class MainLight extends Device{
    constructor(io,half,full){
        super();
        this.io = io;
        this.half = half;
        this.full = full;
        this.timeout = null;
        io.on("change",()=>{
            if(io.value){
                this.timeout = setTimeout(()=>{
                    this.timeout = null;
                    this.long();
                },1000);
            }else{
                if(this.timeout){
                    clearTimeout(this.timeout);
                    this.timeout = null;
                    this.short();
                }
            }
        });

        this.set("status",this.half.value?(this.full.value?"on":"half"):"off");

        this.half.on("change",this.detectState.bind(this))
        this.full.on("change",this.detectState.bind(this))
    }

    detectState(){
        if(this.half.value){
            if(this.full.value){
                this.set("status","on");
            }else{
                this.set("status","half");
            }
        }else{
            this.set("status","off");
        }
    }

    short(){
        if(this.half.value){
            if(this.full.value){
                this.turnOff()
            }else{
                this.turnOn()
            }
        }else{
            this.turnHalfOn()
        }
    }

    long(){
        if(this.half.value){
            if(this.full.value){
                this.turnHalfOn()
            }else{
                this.turnOff()
            }
        }else{
            this.turnOn();
        }
    }

    async turnOff(){
        await Promise.all([
            this.half.set(false),
            this.full.set(false)
        ]);
    }

    async turnHalfOn(){
        await Promise.all([
            this.half.set(true),
            this.full.set(false)
        ]);
    }

    async turnOn(){
        await Promise.all([
            this.half.set(true),
            this.full.set(true)
        ]);
    }
}

module.exports = MainLight;
