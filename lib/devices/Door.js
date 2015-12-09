var Device = require("../device.js");

var Door = module.exports = function Door(io,relay){
    Device.call(this);
    this.io = io;
    this.relay = relay;
    this.autoLock = true;

    this.set("open",!this.io.value);
    this.set("locked",!this.relay.value);

    this.io.on("change",function(){
        this.set("open",!this.io.value);
        this.checkLock(function(){});
    }.bind(this));

    this.relay.on("change",function(){
        this.set("locked",!this.relay.value);
    }.bind(this));

    this.checkLock(function(){})
}

Door.prototype = Object.create(Device.prototype);

Door.prototype.setLocked = function(locked,cb){
    this.relay.set(!locked,function(){
        cb();
        if(!locked && this.autoLock){
            setTimeout(function(){
                this.checkLock(function(){});
            }.bind(this),30*1000);
        }
    }.bind(this));
}

Door.prototype.setAutoLock = function(autolock,cb){
    this.autoLock = autolock;
    this.checkLock(cb);
}

Door.prototype.checkLock = function(cb){
    if(!this.state.locked && this.autoLock){
        this.setLocked(true,cb);
    }else{
        cb();
    }
}
