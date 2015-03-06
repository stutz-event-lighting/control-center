var net = require("net");
var byline = require("byline");
var DeviceServer = module.exports = function DeviceServer(config){
    this.config = config;
    this.connections = [];
    this.devices = {};
    this.server = net.createServer(this.onConnection.bind(this)).listen(config.port);
}

DeviceServer.prototype.add = function(name,device){
    this.devices[name] = device;
    device.on("change",function(){
        for(var i = 0; i < this.connections.length; i++){
            this.connections[i].write(JSON.stringify({type:"state",name:name,state:device.getState()})+"\r\n");
        }
    }.bind(this))
}

DeviceServer.prototype.onConnection = function(c){
    var bl = byline(c);
    this.auth(bl,function(){
        this.connections.push(c);
        this.readCommand(bl);
        c.on("end",function(){
            this.connections.splice(this.connections.indexOf(c),1);
        }.bind(this));
        c.on("error",function(){})
        for(var name in this.devices){
            var device = this.devices[name];
            c.write(JSON.stringify({type:"device",name:name,commands:device.getCommands(),state:device.getState()})+"\r\n");
        }
        c.write(JSON.stringify({type:"end_devices"})+"\r\n")
    }.bind(this))
}

DeviceServer.prototype.readLine = function(c,cb){
    var self = this;
    var line = c.read();
    if(line){
        try{
            line = JSON.parse(line);
            cb(line);
        }catch(e){
            c.end();
        }
    }else{
        c.once("readable",function(){
            self.readLine(c,cb);
        })
    }
}
DeviceServer.prototype.auth = function(c,cb){
    var self = this;
    this.readLine(c,function(data){
        if(data.username == self.config.username && data.password == self.config.password){
            cb();
        }
    }.bind(this))
}
DeviceServer.prototype.readCommand = function(c){
    this.readLine(c,function(cmd){
        if(this.devices[cmd.device]) this.devices[cmd.device].call(cmd.name,cmd.params);
        this.readCommand(c);
    }.bind(this));
}
