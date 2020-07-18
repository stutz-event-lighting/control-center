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
      console.log("searching for hue controllers...");
      var results = await hue.discovery.nupnpSearch();
      console.log("found hue controllers:",results);
      if(!results.length) return;
    	this.api = await hue.api.createLocal(results[0].ipaddress).connect(this.user);
      console.log("connected to hue");
    	await this.updateScenes();
    }

    async updateScenes(){
        var scenes = await this.api.scenes();
        this.set("scenes",scenes
            .filter((scene)=>scene.name.indexOf("boxify-") == 0)
            .map((scene)=>({id:scene.id,name:scene.name.substr(7)}))
        )
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
            await this.api.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify-"+name);
        }else{
            await this.api.createScene([1,2,3,4,5,6,7,8,9],"boxify-"+name);
        }
        this.updateScenes();
    }

    async setScene(id){
        await this.api.activateScene(id)
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
        await this.api.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify");
        this.updateScenes();
    }
}

module.exports = OfficeLight;
