var EventEmitter = require("events").EventEmitter;

module.exports = Relay;

function Relay(hut,index,value){
    EventEmitter.call(this);
    this.hut = hut;
    this.index = index;
    this.value = value;
    this.targetValue = value;
    this.checking = false;
}

Relay.prototype = Object.create(EventEmitter.prototype);

Relay.prototype.update = function(value){
    if(this.value != value){
        this.value = value;
        this.emit("change",value);
    }
}

Relay.prototype.toggle = function(cb){
    this.set(!this.value,cb);
}

Relay.prototype.set = function(value,cb){
    cb = cb||function(){}
    if(this.value == value) return cb();
    this.targetValue = value;
    this.once("change",cb);
    this.check();
}

Relay.prototype.check = function(){
    if(this.checking) return;
    if(this.value != this.targetValue){
        this.checking = true;
        this.hut.setRelay(this.index,this.targetValue);
        var self = this;
        setTimeout(function(){
            self.checking = false;
            self.check();
        },10);
    }
}
