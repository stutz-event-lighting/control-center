"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = require("./tablet-indoor");
class Component extends Base{
	_render(__add){
		super._render.call(this,__add);
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	content(__add){
		super.content.call(this,__add);
		__add(React.createFactory('style'),{"dangerouslySetInnerHTML":{__html:"h1{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "    font-size:30px;" + "\n" + "    line-height:60px;" + "\n" + "    margin-top:30px;" + "\n" + "}"}});
		__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Bistro Licht");
			});
			__add(React.createFactory('div'),{"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Scene 1");
			});
			__add(React.createFactory('div'),{"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Scene 2");
			});
			__add(React.createFactory('div'),{"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Scene 3");
			});
			__add(React.createFactory('div'),{"onClick":this.turnOfficeOn.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Büro Scene hell  ");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Lager Licht         ");
			});
			__add(React.createFactory('div'),{"onClick":this.mainlightOn.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("An");
			});
			__add(React.createFactory('div'),{"onClick":this.mainlightHalfOn.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Halb");
			});
			__add(React.createFactory('div'),{"onClick":this.mainlightOff.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Aus");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Werkstatt Licht");
			});
			__add(React.createFactory('div'),{"onClick":this.workshopOn.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("An");
			});
			__add(React.createFactory('div'),{"onClick":this.workshopOff.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Aus");
			});
			__add(React.createFactory('div'),{"onClick":this.sonosPlay.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Sonos play");
			});
		});
	}
	getNeededPermissions(){
	    return ["officelight","mainlight","workshoplight","sonos"];
	}
	
	mainlightOn(){
	    this.client.devices.mainlight.turnOn();
	}
	
	mainlightHalfOn(){
	    this.client.devices.mainlight.turnHalfOn();
	}
	
	mainlightOff(){
	    this.client.devices.mainlight.turnOff();
	}
	
	workshopOn(){
	    this.client.devices.workshoplight.turnOn();
	}
	
	workshopOff(){
	    this.client.devices.workshoplight.turnOff();
	}
	
	turnOfficeOn(){
	    this.client.devices.officelight.setSceneByName("An");
	}
	
	sonosPlay(){
	    this.client.devices.sonos.play();
	}
}
module.exports = Component;

