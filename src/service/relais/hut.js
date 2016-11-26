var dgram = require("dgram");
var events = require("events");
var Relay = require("./relay.js");
var IO = require("./io.js");

class HUT extends events.EventEmitter{
    constructor(ip,port,username,password){
        super();
        this.ip = ip;
        this.port = port;
        this.username = username;
        this.password = password;
        this.socket = dgram.createSocket('udp4');
        this.socket.bind(this.port,function(){
            self.socket.on("message",function(e){
                self.readMessage(e);
            });
            var buf = new Buffer("wer da?\r\n");
            self.socket.send(buf,0,buf.length,self.port,self.ip);
        });
    }

    readMessage(message){
        message = (message+"").split(":");
        if(message[2] == this.ip){
            if(!this.relays){
                this.relays = message.slice(6,6+8).map((state,i)=>{
                    return new Relay(this,i,state.split(",")[1] === "1").on("change",(val)=>{
                        this.emit("relaychange",i,val);
                    });
                });
                this.ios = message.slice(16,16+8).map((state,i)=>{
                    return new IO(this,i,state.split(",")[2] === "0").on("change",(val)=>{
                        this.emit("iochange",i,val);
                    });
                });
                this.emit("initialized");
            }else{
                message.slice(6,6+8).forEach((state,i)=>{
                    this.relays[i].update(state.split(",")[1] === "1")
                });
                message.slice(16,16+8).forEach((state,i)=>{
                    this.ios[i].update(state.split(",")[2] === "0")
                });
            }
        }
    }

    setRelay(index,value){
        var buf = new Buffer("Sw_"+(value?"on":"off")+(index+1)+this.username+this.password+"\r\n","binary");
        this.socket.send(buf,0,buf.length,this.port,this.ip);
    }
}

module.exports = HUT;
