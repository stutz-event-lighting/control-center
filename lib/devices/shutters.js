var async = require("async");
var Device = require("../device.js");

var Shutters = module.exports = function Shutters(up,down){
    Device.call(this);
    this.up = up;
    this.down = down;
    this.timeout = null;
    this.set("status","stopped");
}

Shutters.prototype = Object.create(Device.prototype);

Shutters.prototype.clear = function(){
    if(this.timeout){
        clearTimeout(this.timeout);
        this.timeout = null;
    }
}

Shutters.prototype.setTimeout = function(time,cb){
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(cb,time);
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
            this.setTimeout(70000,function(){
                this.stop(function(){})
            }.bind(this));
            cb();
        }.bind(this));
    }.bind(this))
}
Shutters.prototype.moveDown = function(cb){
    this.clear();
    this.up.set(false,function(){
        this.down.set(true,function(){
            this.set("status","movingdown");
            this.setTimeout(70000,function(){
                this.stop(function(){})
            }.bind(this));
            cb();
        }.bind(this));
    }.bind(this))
}

Shutters.prototype.tilt = function(cb){
    this.clear();
    this.moveDown(function(){
        this.setTimeout(62*1000,function(){
            this.moveUp(function(){
                this.setTimeout(1000,function(){
                    this.stop(cb);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
}
