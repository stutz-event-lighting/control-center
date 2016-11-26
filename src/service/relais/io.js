var EventEmitter = require("events").EventEmitter;

class IO{
    constructor(hut,index,value){
        this.hut = hut;
        this.index = index;
        this.value = value;
    }

    update(value){
        if(this.value != value){
            this.value = value;
            this.emit("change",value);
        }
    }
}

module.exports = IO;
