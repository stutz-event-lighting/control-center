var client = require("require")("boxify/lib/client.js");
var cookie = require("cookies-js");

module.exports = new Client();

function Client(){

}
Client.prototype.createPin = function(data,cb){
    client.getText("/api/pins/create",{method:"POST",jsonBody:data})
        .then(function(id){
            cb(null,id);
        }).catch(cb);
}
Client.prototype.getPins = function(cb){
    client.getJson("/api/pins",{method:"POST",jsonBody:{}})
        .then(function(pins){
            cb(null,pins);
        }).catch(cb);
}
Client.prototype.updatePin = function(id,data,cb){
    client.execute("/api/pins/"+id+"/update",{method:"POST",jsonBody:data})
        .then(function(){
            cb(null);
        }).catch(cb);
}
Client.prototype.deletePin = function(id,cb){
    client.execute("/api/pins/"+id+"/delete",{method:"POST"})
        .then(function(){
            cb(null);
        }).catch(cb);
}
Client.prototype.login = function(pin,cb){
    client.getJson("/api/pins/login",{method:"POST",jsonBody:{pin:pin}})
        .then(function(session){
            cookie.set("session",session._id,{expires:60*60*24*365*100});
            client.getSession().then(function(sess){
                cb(null,sess);
            }).catch(cb);
        })
        .catch(cb)

}
