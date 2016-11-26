var mount = require("koa-mount");
var upgrade = require("koa-upgrade");
var devices = require("../../devices");
var updateTablet = require("./updateTablet");

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
    }
    loadModels(){
        if(this.boxify.db.Pin) return;
        require("./models")(this.boxify.db);
    }
    async start(){
        this.loadModels();
        setTimeout(()=>{
            for(var ip in this.config.tablets){
                updateTablet(ip,this.boxify.config.url+this.config.tablets[ip]);
            }
        },1000);
    }
    async beforeUpdate(version){
        this.loadModels();
        var db = this.boxify.db;
        if(version == "0.2.0"){
            var contacts = await db.collection("contacts").find({pin:{$exists:true}},{_id:true,pin:true});
            await Promise.all(contacts.map(async function(contact){
                await db.collection("pins").insert({_id:contact._id,pin:contact.pin,rules:[{}]});
            }));
        }
    }
}

module.exports = ControlCenter;
