var EventEmitter = require("events").EventEmitter;

var Device = module.exports = function Device(){
    this.state = {};
    this.commands = {};
}
Device.prototype = Object.create(EventEmitter.prototype);

Device.prototype.set = function(key,value){
    this.state[key] = value;
    this.emit("change");
}

Device.prototype.command = function(name,fn){
    this.commands[name] = fn;
}

Device.prototype.call = function(name,args){
    if(this.commands[name] && args instanceof Array) this.commands[name].apply(this,args);
}

Device.prototype.getCommands = function(){
    return Object.keys(this.commands);
}

Device.prototype.getState = function(){
    return this.state;
}
