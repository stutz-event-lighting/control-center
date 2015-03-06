var Device = require("../device.js");

var Gate = module.exports = function Gate(button,io_closed,io_open,relay_open,relay_close){
    Device.call(this);
    this.direction = "up";
    this.button = button;
    this.io_open = io_open;
    this.io_closed = io_closed;
    this.relay_open = relay_open;
    this.relay_close = relay_close;
    this.inaction = false;

    this.set("state",!this.io_open.value?"open":(!this.io_closed.value?"closed":"stopped"));

    this.button.on("change",function(){
        if(!this.button.value){
            this.press();
        }
    }.bind(this));
    this.io_open.on("change",function(){
        if(!this.io_open.value){
            this.set("state","open");
            this.direction = "up";
        }else if(this.state.state == "open"){
            this.set("state","closing");
        }
    }.bind(this))
    this.io_closed.on("change",function(){
        if(!this.io_closed.value){
            this.set("state","closed");
            this.direction = "down";
        }else if(this.state.state == "closed"){
            this.set("state","opening");
        }
    }.bind(this))

    this.command("open",function(){this.open(function(){})}.bind(this));
    this.command("close",function(){this.close(function(){})}.bind(this));
    this.command("stop",function(){this.stop(function(){})}.bind(this));
}

Gate.prototype = Object.create(Device.prototype);

Gate.prototype.press = function(){
    switch(this.state.state){
        case "open":
            this.close(function(){});
            break;
        case "closed":
            this.open(function(){});
            break;
        case "stopped":
            if(this.direction == "up"){
                this.open(function(){});
            }else{
                this.close(function(){});
            }
            break;
        case "opening":
            this.stop(function(){});
            break;
        case "closing":
            this.stop(function(){});
            break;
    }
}

Gate.prototype.impulse = function(relay,cb){
    if(this.inaction) return;
    this.inaction = true;
    relay.set(true,function(){
        relay.set(false,function(){
            this.inaction = false;
            cb();
        }.bind(this));
    }.bind(this));
}

Gate.prototype.open = function(cb){
    if(this.inaction) return;
    if(this.state.state == "closing"){
        this.stop(function(){
            this.open(cb);
        }.bind(this))
    }else{
        this.impulse(this.relay_open,function(){
            this.set("state","opening");
            cb();
        }.bind(this));
    }
}

Gate.prototype.close = function(cb){
    if(this.inaction) return;
    if(this.state.state == "opening"){
        this.stop(function(){
            this.close(cb);
        }.bind(this))
    }else{
        this.impulse(this.relay_close,function(){
            this.set("state","closing");
            cb();
        }.bind(this));
    }
}

Gate.prototype.stop = function(cb){
    if(this.inaction) return;
    if(this.state.state == "opening"){
        this.impulse(this.relay_close,function(){
            this.set("state","stopped");
            this.direction = "down";
            cb();
        }.bind(this))
    }else if(this.state.state == "closing"){
        this.impulse(this.relay_open,function(){
            this.set("state","stopped");
            this.direction = "up";
            cb();
        }.bind(this))
    }
}
