var Device = require("../device.js");
var sonos = require("sonos");
var entities = new (require("html-entities").XmlEntities)();
var sleep = require("sleep.async");

class Bell extends Device{
    constructor(outdoorlight,url){
        super();
        this.outdoorlight = outdoorlight;
        this.url = "http://"+url+"/public/bell.mp3";
    }

    async getDevice(){
        return await new Promise((s)=>{
            sonos.DeviceDiscovery(async function(device){
                device = new sonos.Sonos(device.host);
                var groups = await device.getAllGroups();
                if(groups.filter(g=>g.host == device.host).length) s(device);
            })
        });
    }

    async ring(){
        var url = this.url;
        var device = await this.getDevice()
        var av = new sonos.Services.AVTransport(device.host);

        var [volume,state,mediaInfo] = await Promise.all([
            device.getVolume(),
            device.getCurrentState(),
            av.GetMediaInfo({InstanceID:0})
        ])
        console.log(volume,state,av)
        await device.play(url);
        await device.setVolume(50);
        await sleep(3000);

        await device.setVolume(volume);
        await sleep(1000);
        await av.SetAVTransportURI({InstanceID:0,CurrentURI:entities.encode(mediaInfo.CurrentURI),CurrentURIMetaData:entities.encode(mediaInfo.CurrentURIMetaData)});
        if(state != "playing") return;

        await device.play();
    }

    async light(){
        await this.outdoorlight.turnOn();
        await sleep(5*60*1000);
        await this.outdoorlight.turnOff();
    }
}

module.exports = Bell;
