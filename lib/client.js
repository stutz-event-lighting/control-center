var client = require("boxify/lib/client.js");
var cookie = require("cookies-js");

module.exports = new Client();


function Client(){

}
Client.prototype.createPin = function(id,pin,cb){
    client.fetch("/api/pins/create",JSON.stringify({_id:id,pin:pin}),cb);
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
        client.session = session;
        cookie.set("session",session._id,{expires:60*60*24*365*100});
        cb();
    });
}

var menu = require("boxify/lib/views/menu.jade").menu;
menu.Elektronik = {url:"/electronic",loggedIn:true};
menu.Zugänge = {url:"/pins",loggedIn:true};

require("boxify/lib/views/profile.jade").extensionSections.push(require("./views/PinSection.jade"));
