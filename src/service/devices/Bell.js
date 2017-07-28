var Device = require("../device.js");
var sonos = require("sonos");
var entities = new (require("html-entities").XmlEntities)();
var sleep = require("sleep.async");
var pify = require("pify");

class Bell extends Device{
    constructor(outdoorlight,url){
        super();
        this.outdoorlight = outdoorlight;
        this.url = "http://"+url+"/public/bell.mp3";
    }

    async getDevice(){
        return await new Promise((s)=>{
            sonos.search(async function(device){
                device = new sonos.Sonos(device.host);
                var topo = await pify(device.getTopology.bind(device))();
                if(topo.zones.filter((t)=>t.coordinator=="true")[0].location.indexOf(device.host)>=0) s(device);
            })
        });
    }

    async ring(){
        var url = this.url;
        var device = await this.getDevice()
        var av = new sonos.Services.AVTransport(device.host);

        var [volume,state,mediaInfo] = await Promise.all([
            pify(device.getVolume.bind(device))(),
            pify(device.getCurrentState.bind(device))(),
            pify(av.GetMediaInfo.bind(av))({InstanceID:0})
        ])
        await pify(device.play.bind(device))(url);
        await pify(device.setVolume.bind(device))(50);
        await sleep(3000);

        await pify(device.setVolume.bind(device))(volume);
        await sleep(1000);
        await pify(av.SetAVTransportURI.bind(av))({InstanceID:0,CurrentURI:entities.encode(mediaInfo.CurrentURI),CurrentURIMetaData:entities.encode(mediaInfo.CurrentURIMetaData)});
        if(state != "playing") return;

        await pify(device.play.bind(device))();
    }

    async light(){
        await this.outdoorlight.turnOn();
        await sleep(5*60*1000);
        await this.outdoorlight.turnOff();
    }
}

module.exports = Bell;
