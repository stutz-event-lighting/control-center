var sonos = require("sonos");

var AllOff = module.exports = function(button,lights){
    button.on("change",function(){
        if(!button.value){
            for(var i = 0; i < lights.length; i++){
                lights[i].set(false,function(){})
            }
            sonos.search(function(device){
                new sonos.Sonos(device.host).pause(function(){});
            })
        }
    })
}
