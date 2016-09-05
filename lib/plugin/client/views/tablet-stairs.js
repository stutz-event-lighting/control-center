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
		__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Tor");
			});
			__add(React.createFactory('div'),{"onClick":this.gateOpen.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Auf");
			});
			__add(React.createFactory('div'),{"onClick":this.gateStop.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Stop");
			});
			__add(React.createFactory('div'),{"onClick":this.gateClose.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Zu");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Lager Licht");
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
		__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Aussen Licht");
			});
			__add(React.createFactory('div'),{"onClick":this.outdoorlightOn.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("An");
			});
			__add(React.createFactory('div'),{"onClick":this.outdoorlightOff.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Aus ");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Lager");
			});
			__add(React.createFactory('div'),{"onClick":this.sonosPlay.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Sonos play");
			});
			__add(React.createFactory('div'),{"onClick":this.lockDoors.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Verriegeln");
			});
			__add(React.createFactory('div'),{"onClick":this.unlockDoors.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Entriegeln");
			});
			__add(React.createFactory('div'),{"onClick":this.goHome.bind(this),"className":'btn' + " " + 'btn-danger'},function(__add){
				__add("Go Home");
			});
		});
		if (this.state.goHomeCountdown){
			__add(React.createFactory(Modal),{},function(__add){
				__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
					__add(React.createFactory('h2'),{},function(__add){
						__add("Selbstzerstörung in "+this.state.goHomeCountdown+"s...");
					});
				});
				__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
					__add(React.createFactory('button'),{"onClick":this.abortGoHome.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
						__add("Abbrechen");
					});
				});
			});
		}
	}
	constructor(props,context){
	    super(props,context);
	    this.listen = true;
	}
	getNeededPermissions(){
	    return ["mainlight","workshoplight","outdoorlight","outerdoor","innerdoor","officelight","sonos"];
	}
	
	gateOpen(){
	    this.client.devices.gate.open();
	}
	
	gateClose(){
	    this.client.devices.gate.close();
	}
	
	gateStop(){
	    this.client.devices.gate.stop();
	}
	
	goHome(){
	    if(checkDark()){
	        this.outdoorlightOn();
	    }
	    this.state.goHomeCountdown = 30;
	    this.goHomeInterval= setInterval(function(){
	        if(--this.state.goHomeCountdown <= 0){
	            clearInterval(this.goHomeInterval);
	            this.mainlightOff();
	            this.client.devices.workshoplight.turnOff();
	            this.lockDoors();
	            this.sonosPause();
	            this.client.devices.officelight.setSceneByName("Aus");
	            setTimeout(function(){
	                this.outdoorlightOff();
	            }.bind(this),3*60*1000)
	        }
	        this.forceUpdate();
	    }.bind(this),1000);
	    this.forceUpdate();
	}
	
	abortGoHome(){
	    clearInterval(this.goHomeInterval);
	    delete this.state.goHomeCountdown;
	    this.forceUpdate()
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
	
	outdoorlightOn(){
	    this.client.devices.outdoorlight.turnOn();
	}
	
	outdoorlightOff(){
	    this.client.devices.outdoorlight.turnOff();
	}
	
	sonosPlay(){
	    this.client.devices.sonos.play();
	}
	
	sonosPause(){
	    this.client.devices.sonos.pause();
	}
	
	lockDoors(){
	    this.client.devices.innerdoor.setAutoLock(true);
	    this.client.devices.outerdoor.setAutoLock(true);
	}
	
	unlockDoors(){
	    this.client.devices.innerdoor.setAutoLock(false);
	    this.client.devices.outerdoor.setAutoLock(false);
	}
}
module.exports = Component;

var DeviceClient = require("../client/index");
var checkDark = require("../../../service/checkDark");
var Modal = require("require")("boxify/lib/views/Modal.js");
