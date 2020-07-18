var async = require("async");
var Device = require("../device.js");
var hue = require("node-hue-api").v3;

class OfficeLight extends Device{
    constructor(user){
        super();
        this.user = user;
        this.set("scenes",[]);
        this.api = {scenes:function(){},updateScene:function(){},createScene:function(){}}
        this.init().catch(e=>{
          console.error(e)
        });
    }

    async init(){
    	this.api = await hue.api.createInsecureLocal("192.168.1.37").connect(this.user);
      console.log("connected to hue");
    	await this.updateScenes();
    }

    async updateScenes(){
        this.set("scenes",[{
          id:"node-hue-api-11",
          name:"Go Home"
        },{
          id:"node-hue-api-26",
          name:"Event-Durchgang"
        },{
          id:"node-hue-api-17",
          name:"Blue"
        },{
          id:"node-hue-api-21",
          name:"Fäbu Work"
        },{
          id:"node-hue-api-9",
          name:"An"
        },{
          id:"node-hue-api-14",
          name:"Chillen"
        },{
          id:"node-hue-api-6",
          name:"Aus"
        }])
    }

    async createScene(name){
        var id;
        for(var i = 0; i < this.state.scenes.length; i++){
            if(!this.state.scenes[i].name){
                id = this.state.scenes[i].id;
                break;
            }
        }
        if(id){
            await this.api.scenes.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify-"+name);
        }else{
            await this.api.scenes.createScene([1,2,3,4,5,6,7,8,9],"boxify-"+name);
        }
        this.updateScenes();
    }

    async setScene(id){
        await this.api.scenes.activateScene(id)
    }

    async setSceneByName(name){
        for(var i = 0; i < this.state.scenes.length; i++){
            var scene = this.state.scenes[i];
            if(scene.name == name){
                await this.setScene(scene.id);
                return;
            }
        }
    }

    async deleteScene(id){
        await this.api.scenes.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify");
        this.updateScenes();
    }
}

module.exports = OfficeLight;
