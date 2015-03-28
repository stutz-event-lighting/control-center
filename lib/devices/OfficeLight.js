var async = require("async");
var Device = require("../device.js");
var hue = require("node-hue-api");

var OfficeLight = module.exports = function MainLight(user){
    Device.call(this);
    hue.nupnpSearch(function(err, result) {
        if (err) throw err;
        this.api = new hue.HueApi(result[0].ipaddress,user);
        this.updateScenes();
    }.bind(this));

    this.set("scenes",[]);
    this.command("createScene",this.createScene.bind(this));
    this.command("setScene",this.setScene.bind(this))
    this.command("deleteScene",this.deleteScene.bind(this))


    /*

    this.command("turnOn",function(){this.turnOn(function(){})}.bind(this)))
    this.command("turnOff",function(){this.turnOff(function(){})}.bind(this))*/
}

OfficeLight.prototype = Object.create(Device.prototype);

OfficeLight.prototype.updateScenes = function(){
    this.api.scenes(function(err,scenes){
        this.set("scenes",scenes.filter(function(scene){
            return scene.name.indexOf("boxify-") == 0
        }).map(function(scene){
            return {id:scene.id,name:scene.name.substr(7)};
        }));
    }.bind(this));
}

OfficeLight.prototype.createScene = function(name){
    var id;
    for(var i = 0; i < this.state.scenes.length; i++){
        if(!this.state.scenes[i].name){
            id = this.state.scenes[i].id;
            break;
        }
    }
    if(id){
        this.api.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify-"+name,function(){
            this.updateScenes();
        }.bind(this))
    }else{
        this.api.createScene([1,2,3,4,5,6,7,8,9],"boxify-"+name,function(){
            this.updateScenes();
        }.bind(this));
    }
}

OfficeLight.prototype.setScene = function(id,cb){
    this.api.activateScene(id,cb||function(){})
}

OfficeLight.prototype.setSceneByName = function(name){
    for(var i = 0; i < this.state.scenes.length; i++){
        var scene = this.state.scenes[i];
        if(scene.name == name){
            this.setScene(scene.id);
            break;
        }
    }
}

OfficeLight.prototype.deleteScene = function(id){
    this.api.updateScene(id,[1,2,3,4,5,6,7,8,9],"boxify",function(){
        this.updateScenes();
    }.bind(this))
}
