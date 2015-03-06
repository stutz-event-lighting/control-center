var async = require("async");
var Device = require("../device.js");
var MainLight = module.exports = function MainLight(io,half,full){
    Device.call(this);
    this.io = io;
    this.half = half;
    this.full = full;
    this.timeout = null;
    io.on("change",function(){
        if(io.value){
            this.timeout = setTimeout(function(){
                this.timeout = null;
                this.long();
            }.bind(this),1000);
        }else{
            if(this.timeout){
                clearTimeout(this.timeout);
                this.timeout = null;
                this.short();
            }
        }
    }.bind(this));

    this.set("status",this.half.value?(this.full.value?"on":"half"):"off");

    this.half.on("change",this.detectState.bind(this))
    this.full.on("change",this.detectState.bind(this))

    this.command("turnOn",function(){this.turnOn(function(){})}.bind(this))
    this.command("turnHalfOn",function(){this.turnHalfOn(function(){})}.bind(this))
    this.command("turnOff",function(){this.turnOff(function(){})}.bind(this))
}

MainLight.prototype = Object.create(Device.prototype);

MainLight.prototype.detectState = function(){
    if(this.half.value){
        if(this.full.value){
            this.set("status","on");
        }else{
            this.set("status","half");
        }
    }else{
        this.set("status","off");
    }
}

MainLight.prototype.short = function(){
    if(this.half.value){
        if(this.full.value){
            this.turnOff(function(){})
        }else{
            this.turnOn(function(){})
        }
    }else{
        this.turnHalfOn(function(){})
    }
}

MainLight.prototype.long = function(){
    if(this.half.value){
        if(this.full.value){
            this.turnHalfOn(function(){})
        }else{
            this.turnOff(function(){})
        }
    }else{
        this.turnOn(function(){});
    }
}

MainLight.prototype.turnOff = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(false,cb);
        },
        function(cb){
            self.full.set(false,cb);
        }
    ],cb)
}

MainLight.prototype.turnHalfOn = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(true,cb);
        },
        function(cb){
            self.full.set(false,cb);
        }
    ],cb)
}

MainLight.prototype.turnOn = function(cb){
    var self = this;
    async.parallel([
        function(cb){
            self.half.set(true,cb);
        },
        function(cb){
            self.full.set(true,cb);
        }
    ],cb)
}
