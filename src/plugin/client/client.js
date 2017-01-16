var client = require("require")("boxify/lib/client.js");
var cookie = require("cookies-js");

class Client{
    async createPin(data){
        return await client.getText("/api/pins/create",{method:"POST",jsonBody:data});
    }
    async getPins(){
        return await client.getJson("/api/pins",{method:"POST",jsonBody:{}});
    }
    async updatePin(id,data){
        return await client.execute("/api/pins/"+id+"/update",{method:"POST",jsonBody:data});
    }
    async deletePin(id){
        return await client.execute("/api/pins/"+id+"/delete",{method:"POST"});
    }
    async login(pin,cb){
        var session = await client.getJson("/api/pins/login",{method:"POST",jsonBody:{pin:pin}});
        cookie.set("session",session._id,{expires:60*60*24*365*100});
        return session;
    }
}

module.exports = new Client();
