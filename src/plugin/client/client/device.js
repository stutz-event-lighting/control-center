var devices = require("../../../devices");

class Device{
    constructor(name){
        this.name = name;
        this.state = {};
        var commands = devices[name].commands;
        for(var i = 0; i < commands.length; i++){
            ((command)=>{
                this[command] = async function(){
                    var args = Array.prototype.slice.call(arguments);
                    await new Promise((s)=>{
                        var req = new XMLHttpRequest();
                        req.open("POST","/api/electronic/"+name+"/"+command)
                        req.setRequestHeader("Content-Type","application/json");
                        req.onreadystatechange = function(){
                            if(req.readyState == 4){
                                s();
                            }
                        }
                        req.send(JSON.stringify());
                    })
                }
            })(commands[i])
        }
    }
    updateState(state){
        this.state = state;
    }
}

module.exports = Device;
