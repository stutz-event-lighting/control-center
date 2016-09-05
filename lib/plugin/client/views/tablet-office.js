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
				__add("Licht");
			});
			__add(React.createFactory('div'),{"onClick":this.setScene("Aus"),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Aus");
			});
			__add(React.createFactory('div'),{"onClick":this.setScene("An"),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("An");
			});
			__add(React.createFactory('div'),{"onClick":this.setScene("Chregi Work"),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Chregi");
			});
			__add(React.createFactory('div'),{"onClick":this.setScene("Fäbu Work"),"className":'btn' + " " + 'btn-primary'},function(__add){
				__add("Fäbu");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Storen");
			});
			__add(React.createFactory('div'),{"onClick":this.shuttersUp.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Hoch");
			});
			__add(React.createFactory('div'),{"onClick":this.shuttersDown.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Runter");
			});
			__add(React.createFactory('div'),{"onClick":this.shuttersStop.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Stop");
			});
			__add(React.createFactory('div'),{"onClick":this.shuttersTilt.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
				__add("Gekippt");
			});
		});
		__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Lager");
			});
			__add(React.createFactory('div'),{"onClick":this.mainlightHalfOn.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Lager Licht halb");
			});
			__add(React.createFactory('div'),{"onClick":this.mainlightOff.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Lager Licht aus");
			});
			__add(React.createFactory('div'),{"onClick":this.sonosPlay.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
				__add("Sonos play");
			});
			__add(React.createFactory('div'),{"onClick":this.goHome.bind(this),"className":'btn' + " " + 'btn-danger'},function(__add){
				__add("Go Home");
			});
		});
		if (this.state.showGateWarning){
			__add(React.createFactory(Modal),{},function(__add){
				__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
					__add(React.createFactory('h2'),{},function(__add){
						__add("Achtung!");
					});
				});
				__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
					__add("Das Tor ist noch geöffnet. Bitte schliessen Sie es bevor sie gehen!");
				});
				__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
					__add(React.createFactory('button'),{"onClick":this.closeGateWarning.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
						__add("Mach ich, danke!");
					});
				});
			});
		}
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
	    return ["officelight","mainlight","workshoplight","outdoorlight","shutters","outerdoor","innerdoor","gate","sonos"];
	}
	    
	shuttersUp(){
	    this.client.devices.shutters.moveUp();
	}
	
	shuttersDown(){
	    this.client.devices.shutters.moveDown();
	}
	
	shuttersStop(){
	    this.client.devices.shutters.stop();
	}
	
	shuttersTilt(){
	    this.client.devices.shutters.tilt();
	}
	
	setScene(name){
	    return function(){
	        this.client.devices.officelight.setSceneByName(name);
	    }.bind(this)
	}
	
	mainlightHalfOn(){
	    this.client.devices.mainlight.turnHalfOn();
	}
	
	mainlightOff(){
	    this.client.devices.mainlight.turnOff();
	}
	
	goHome(){        
	    if(this.client.devices.gate.state.state != "closed" || this.client.devices.outerdoor.state.open){
	        this.state.showGateWarning = true;            
	    }else{
	        this.state.goHomeCountdown = 30;
	        this.goHomeInterval= setInterval(function(){
	            if(--this.state.goHomeCountdown <= 0){
	                clearInterval(this.goHomeInterval);
	                this.mainlightOff();
	                this.client.devices.workshoplight.turnOff();
	                this.client.devices.outdoorlight.turnOff();
	                this.client.devices.officelight.setSceneByName("Aus");
	                this.client.devices.innerdoor.setAutoLock(true);
	                this.client.devices.outerdoor.setAutoLock(true);
	                this.client.devices.sonos.pause();
	            }
	            this.forceUpdate();
	        }.bind(this),1000);
	    }
	    this.forceUpdate();
	}   
	
	closeGateWarning(){
	    delete this.state.showGateWarning;
	    this.forceUpdate();
	}
	
	abortGoHome(){
	    clearInterval(this.goHomeInterval);
	    delete this.state.goHomeCountdown;
	    this.forceUpdate()
	}
	
	sonosPlay(){
	    this.client.devices.sonos.play();
	}
}
module.exports = Component;

var DeviceClient = require("../client/index");
var Modal = require("require")("boxify/lib/views/Modal.js");
