var async = require("async");
var Device = require("../device.js");
var hue = require("node-hue-api");
var pify = require("pify");

class OfficeLight extends Device{
    constructor(user){
        this.user = user;
        this.set("scenes",[]);
        this.api = {scenes:function(){},updateScene:function(){},createScene:function(){}}
        this.init();
    }

    async init(){
        var results = await pify(hue.nupnpSearch.bind(hue))()
        if(!results.length) return;
    	this.api = new hue.HueApi(result[0].ipaddress,user);
    	await this.updateScenes();
    }

    async updateScenes(){
        var scenes = await pify(this.api.scenes.bind(this.api))();
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
            await pify(this.api.updateScene.bind(this.api))(id,[1,2,3,4,5,6,7,8,9],"boxify-"+name);
        }else{
            await pify(this.api.createScene.bind(this.api))([1,2,3,4,5,6,7,8,9],"boxify-"+name);
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
        await pify(this.api.updateScene.bind(this.api))(id,[1,2,3,4,5,6,7,8,9],"boxify");
        this.updateScenes();
    }
}

module.exports = OfficeLight;
