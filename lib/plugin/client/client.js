var client = require("require")("boxify/lib/client.js");
var cookie = require("cookies-js");

module.exports = new Client();

function Client(){

}
Client.prototype.createPin = function(data,cb){
    client.fetch("/api/pins/create",JSON.stringify({_id:data.contect,pin:data.pin,full:data.full}),cb);
}
Client.prototype.getPins = function(cb){
    client.fetchJSON("/api/pins",JSON.stringify({}),cb);
}
Client.prototype.updatePin = function(id,data,cb){
    client.fetch("/api/pins/"+id+"/update",JSON.stringify(data),cb);
}
Client.prototype.deletePin = function(id,cb){
    client.fetch("/api/pins/"+id+"/delete",null,cb);
}
Client.prototype.login = function(pin,cb){
    client.fetchJSON("/api/pins/login",JSON.stringify({pin:pin}),function(err,session){
        if(err) return cb(err);
        cookie.set("session",session._id,{expires:60*60*24*365*100});
        client.getSession(cb);
    });
}

var menu = require("require")("boxify/lib/views/menu.js").menu;
menu.Elektronik = {url:"/electronic",loggedIn:true};
menu.Zugänge = {url:"/pins",loggedIn:true};

require("require")("boxify/lib/views/profile.js").extensionSections.push(require("./views/PinSection"));
