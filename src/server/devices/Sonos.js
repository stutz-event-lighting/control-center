var Device = require("../device.js");
var sonos = require("sonos");

class Sonos extends Device{
    async getDevice(){
        return await new Promise((s)=>{
            sonos.DeviceDiscovery(async function(device){
                device = new sonos.Sonos(device.host);
                var track = await device.currentTrack();
                if(track.title) s(device);
            })
        });
    }

    async play(cb){
        (await this.getDevice()).play();
    }

    async pause(cb){
        (await this.getDevice()).pause();
    }
}
module.exports = Sonos;
