var Device = require("../device.js");
var sonos = require("sonos");
var pify = require("pify");

class Sonos extends Device{
    async getDevice(){
        var device = await pify(sonos.search.bind(sonos))()
        return new sonos.Sonos(device.host);
    }

    async play(cb){
        (await this.getDevice()).play(function(){});
    }

    async pause(cb){
        (await this.getDevice()).pause(function(){});
    }
}
module.exports = Sonos;
