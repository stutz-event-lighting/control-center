var co = require("co");
var mount = require("koa-mount");
var upgrade = require("koa-upgrade");
var devices = require("../../devices");
var updateTablet = require("./updateTablet");

module.exports = function(boxify,config){
    return new ControlCenter(boxify,config);
}

class ControlCenter{
    constructor(boxify,config){
        this.boxify = boxify;
        this.boxify.controlCenter = this;
        this.config = config;

        upgrade(this.boxify.app);

        for(var device in devices){
            if(!devices[device].public) boxify.addPermission(device,devices[device].name)
        }
        boxify.app.use(mount("/api",require("./api")));
        require("../routes");
    }
    loadModels(){
        if(this.boxify.db.Pin) return;
        require("./models")(this.boxify.db);
    }
    *start(){
        this.loadModels();
        setTimeout(()=>{
            for(var ip in this.config.tablets){
                updateTablet(ip,this.boxify.config.url+this.config.tablets[ip]);
            }
        },1000);
    }
    *beforeUpdate(version){
        this.loadModels();
        var db = this.boxify.db;
        if(version == "0.2.0"){
            var contacts = yield db.collection("contacts").find({pin:{$exists:true}},{_id:true,pin:true});
            yield contacts.map(function*(contact){
                yield db.collection("pins").insert({_id:contact._id,pin:contact.pin,rules:[{}]});
            });
        }
    }
}