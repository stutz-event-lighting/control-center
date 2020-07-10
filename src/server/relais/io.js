var EventEmitter = require("events").EventEmitter;

class IO extends EventEmitter{
    constructor(hut,index,value){
        super();
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
