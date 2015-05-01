var devices = require("../devices.js");

var Device = module.exports = function Device(name){
    this.name = name;
    this.state = {};
    var commands = devices[name].commands;
    for(var i = 0; i < commands.length; i++){
        (function(command){
            this[command] = function(){
                var req = new XMLHttpRequest();
                req.open("POST","/api/electronic/"+name+"/"+command)
                req.setRequestHeader("Content-Type","application/json");
                req.onreadystatechange = function(){
                    if(req.readyState == 4){
                        //done
                    }
                }
                req.send(JSON.stringify(Array.prototype.slice.call(arguments)));
            }
        }).bind(this)(commands[i])
    }
}

Device.prototype.updateState = function(state){
    this.state = state;
}
