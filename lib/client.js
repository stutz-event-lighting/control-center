var client = require("boxify/lib/client.js");

module.exports = new Client();


function Client(){

}
Client.prototype.createPin = function(contact,pin,cb){
    client.fetch("/api/pins/create",JSON.stringify({contact:contact,pin:pin}),cb);
}
Client.prototype.getPins = function(cb){
    client.fetchJSON("/api/pins",JSON.stringify({}),cb);
}
