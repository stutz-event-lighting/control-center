var Device = require("../device.js");
var sonos = require("sonos");
var entities = new (require("html-entities").XmlEntities)();
var async = require("async");

var Bell = module.exports = function Bell(outdoorlight,url){
    Device.call(this);

    this.outdoorlight = outdoorlight;
    this.url = "http://"+url+"/public/bell.mp3";
}

Bell.prototype = Object.create(Device.prototype);

Bell.prototype.ring = function(cb){
    var url = this.url;
    sonos.search(function(device){
        device = new sonos.Sonos(device.host);
        device.currentTrack(function(err,track){
            if(track.title){
                var av = new sonos.Services.AVTransport(device.host);
                async.parallel([
                    function(cb){
                        device.getVolume(cb);
                    },
                    function(cb){
                        device.getCurrentState(cb);
                    },
                    function(cb){
                        av.GetMediaInfo({InstanceID:0},cb)
                    }
                ],function(err,results){
                    if(err) throw err;
                    var volume = results[0];
                    var state = results[1];
                    var mediaInfo = results[2];

                    device.play(url,function(err){
                        device.setVolume(100,function(){
                            setTimeout(function(){
                                device.setVolume(volume,function(err){
                                    av.SetAVTransportURI({InstanceID:0,CurrentURI:entities.encode(mediaInfo.CurrentURI),CurrentURIMetaData:entities.encode(mediaInfo.CurrentURIMetaData)},function(err){
                                        if(state != "playing") return;
                                        device.play(function(err){

                                        })
                                    })
                                })
                            },3000);
                        })
                    });
                })
            }
        })
    }.bind(this));
}

Bell.prototype.light = function(cb){
    this.outdoorlight.turnOn(function(){
        setTimeout(function(){
            this.outdoorlight.turnOff(cb);
        }.bind(this),5*60*1000)
    }.bind(this))
}
