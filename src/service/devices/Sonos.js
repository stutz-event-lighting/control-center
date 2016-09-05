var Device = require("../device.js");
var sonos = require("sonos");

var Sonos = module.exports = function Sonos(relay){
    Device.call(this);
}

Sonos.prototype = Object.create(Device.prototype);

Sonos.prototype.play = function(cb){
    sonos.search(function(device){
        this.sonos = new sonos.Sonos(device.host).play(function(){});
    }.bind(this));
}

Sonos.prototype.pause = function(cb){
    sonos.search(function(device){
        this.sonos = new sonos.Sonos(device.host).pause(function(){});
    }.bind(this));
}
