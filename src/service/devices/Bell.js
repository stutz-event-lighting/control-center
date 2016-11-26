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

    async ring(){
        var url = this.url;
        var device = await new Promise((s)=>sonos.search(s));
        device = new sonos.Sonos(device.host);

        var track = await pify(device.currentTrack)();
        if(!track.title) return;
        var av = new sonos.Services.AVTransport(device.host);

        var [volume,state,mediaInfo] = await Promise.all([
            pify(device.getVolume.bind(device))(),
            pify(device.getCurrentState.bind(device))(),
            pify(av.GetMediaInfo.bind(av))()
        ])

        await pify(device.play.bind(device))(url);
        await pify(device.setVolume.bind(device))(100);
        await sleep(3000);

        await pify(device.setVolume.bind(device))(volume);
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
