var EventEmitter = require("events").EventEmitter;

class Device extends EventEmitter{
    constructor(){
        this.state = {};
    }

    set(key,value){
        this.state[key] = value;
        this.emit("change");
    }

    getState (){
        return this.state;
    }
}
