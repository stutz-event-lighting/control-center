var async = require("async");
var Device = require("../device.js");

var Shutters = module.exports = function Shutters(up,down){
    Device.call(this);
    this.up = up;
    this.down = down;
    this.timeout = null;
    this.set("status","stopped");
    this.command("stop",function(){
        this.stop(function(){});
    }.bind(this))
    this.command("moveUp",function(){
        this.moveUp(function(){});
    }.bind(this))
    this.command("moveDown",function(){
        this.moveDown(function(){});
    }.bind(this))
}

Shutters.prototype = Object.create(Device.prototype);

Shutters.prototype.clear = function(){
    if(this.timeout){
        clearTimeout(this.timeout);
        this.timeout = null;
    }
}

Shutters.prototype.stop = function(cb){
    this.clear();
    var self = this;
    async.parallel([
        function(cb){
            self.up.set(false,cb)
        },
        function(cb){
            self.down.set(false,cb)
        }
    ],function(){
        self.set("status","stopped");
        cb();
    });
}

Shutters.prototype.moveUp = function(cb){
    this.clear();
    this.down.set(false,function(){
        this.up.set(true,function(){
            this.set("status","movingup");
            cb();
        }.bind(this));
    }.bind(this))
}
Shutters.prototype.moveDown = function(cb){
    this.clear();
    this.up.set(false,function(){
        this.down.set(true,function(){
            this.set("status","movingdown");
            cb();
        }.bind(this));
    }.bind(this))
}
