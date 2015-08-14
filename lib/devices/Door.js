var Device = require("../device.js");

var Door = module.exports = function Door(io,relay){
    Device.call(this);
    this.io = io;
    this.relay = relay;

    this.set("open",this.io.value);
    this.set("locked",this.relay.value);

    this.io.on("change",function(){
        this.set("open",this.io.value);
    }.bind(this));

    this.relay.on("change",function(){
        this.set("locked",this.relay.value);
    }.bind(this));
}

Door.prototype = Object.create(Device.prototype);

Door.prototype.setLocked = function(open,cb){
    this.relay.set(open,function(){
        cb();
    });
}
