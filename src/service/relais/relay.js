var IO = require("./io");

class Relay extends IO{
    constructor(hut,index,value){
        super(hut,index,value)
        this.targetValue = value;
        this.checking = false;
    }

    async toggle(){
        await this.set(!this.value);
    }

    async set(value){
        if(this.value == value) return;
        await new Promise((s)=>{
            this.targetValue = value;
            this.once("change",cb);
            this.check();
        });
    }

    check(){
        if(this.checking) return;
        if(this.value != this.targetValue){
            this.checking = true;
            this.hut.setRelay(this.index,this.targetValue);
            setTimeout(()=>{
                this.checking = false;
                this.check();
            },10);
        }
    }
}

module.exports = Relay;
