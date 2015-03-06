var dgram = require("dgram");
var events = require("events");
var Relay = require("./relay.js");
var IO = require("./io.js");

module.exports = HUT;

function HUT(ip,port,username,password){
    events.EventEmitter.call(this);
    this.ip = ip;
    this.port = port;
    this.username = username;
    this.password = password;
    this.socket = dgram.createSocket('udp4');
}

HUT.prototype = Object.create(events.EventEmitter.prototype);

HUT.prototype.initialize = function(cb){
    var self = this;
    this.once("initialized",cb);
    this.socket.bind(this.port,function(){
        self.socket.on("message",function(e){
            self.readMessage(e);
        });
        var buf = new Buffer("wer da?\r\n");
        self.socket.send(buf,0,buf.length,self.port,self.ip);
    });
}

HUT.prototype.readMessage = function(message){
    var self = this;
    message = (message+"").split(":");
    if(message[2] == this.ip){
        if(!this.relays){
            this.relays = message.slice(6,6+8).map(function(state,i){
                return new Relay(self,i,state.split(",")[1] === "1").on("change",function(val){
                    self.emit("relaychange",i,val);
                });
            });
            this.ios = message.slice(16,16+8).map(function(state,i){
                return new IO(self,i,state.split(",")[2] === "0").on("change",function(val){
                    self.emit("iochange",i,val);
                });
            });
            this.emit("initialized");
        }else{
            message.slice(6,6+8).forEach(function(state,i){
                self.relays[i].update(state.split(",")[1] === "1")
            });
            message.slice(16,16+8).forEach(function(state,i){
                self.ios[i].update(state.split(",")[2] === "0")
            });
        }
    }
}

HUT.prototype.setRelay = function(index,value){
    var buf = new Buffer("Sw_"+(value?"on":"off")+(index+1)+this.username+this.password+"\r\n","binary");
    this.socket.send(buf,0,buf.length,this.port,this.ip);
}
