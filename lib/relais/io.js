var EventEmitter = require("events").EventEmitter;

module.exports = IO;

function IO(hut,index,value){
    EventEmitter.call(this);
    this.hut = hut;
    this.index = index;
    this.value = value;
}

IO.prototype = Object.create(EventEmitter.prototype);

IO.prototype.update = function(value){
    if(this.value != value){
        this.value = value;
        this.emit("change",value);
    }
}
