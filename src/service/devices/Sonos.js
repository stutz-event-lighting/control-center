var Device = require("../device.js");
var sonos = require("sonos");
var pify = require("pify");

class Sonos extends Device{
    async getDevice(){
        return await new Promise((s)=>{
            sonos.search(async function(device){
                device = new sonos.Sonos(device.host);
                var track = await pify(device.currentTrack.bind(device))();
                if(track.title) s(device);
            })
        });
    }

    async play(cb){
        (await this.getDevice()).play(function(){});
    }

    async pause(cb){
        (await this.getDevice()).pause(function(){});
    }
}
module.exports = Sonos;
