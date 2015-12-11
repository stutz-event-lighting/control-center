var Device = require("../device.js");
var sonos = require("sonos");
var entities = new (require("html-entities").XmlEntities)();

var Bell = module.exports = function Bell(outdoorlight,url){
    Device.call(this);

    this.outdoorlight = outdoorlight;
    this.url = "http://"+url+"/public/control-center/bell.mp3";
}

Bell.prototype = Object.create(Device.prototype);

Bell.prototype.ring = function(cb){
    var url = this.url;
    sonos.search(function(device){
        device = new sonos.Sonos(device.host);
        device.currentTrack(function(err,track){
            if(track.title){
                var av = new sonos.Services.AVTransport(device.host);
                device.getVolume(function(err,volume){
                    av.GetMediaInfo({InstanceID:0},function(err,data){
                        if(err) throw err;
                        device.play(url,function(err){
                            device.setVolume(100,function(){
                                setTimeout(function(){
                                    device.setVolume(volume,function(err){
                                        av.SetAVTransportURI({InstanceID:0,CurrentURI:entities.encode(data.CurrentURI),CurrentURIMetaData:entities.encode(data.CurrentURIMetaData)},function(err){
                                            device.play(function(err){

                                            })
                                        })
                                    })
                                },3000);
                            })
                        });
                    })
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
