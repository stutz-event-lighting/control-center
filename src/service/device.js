var EventEmitter = require("events").EventEmitter;

var Device = module.exports = function Device(){
    this.state = {};
}
Device.prototype = Object.create(EventEmitter.prototype);

Device.prototype.set = function(key,value){
    this.state[key] = value;
    this.emit("change");
}

Device.prototype.call = function(name,args){
    if(args instanceof Array) {
        this[name].apply(this,args.concat([function(){
        }]));
    }
}

Device.prototype.getCommands = function(){
    return this.commands;
}

Device.prototype.getState = function(){
    return this.state;
}
