"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = require("boxify/lib/views/base");
class Component extends Base{
	_render(__add){
		super._render.call(this,__add);
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	body(__add){
		super.body.call(this,__add);
		clearindex = 1;
		__add(React.createFactory('style'),{"dangerouslySetInnerHTML":{__html:"h4{" + "\n" + "    margin-top:30px;" + "\n" + "    margin-bottom:0px;" + "\n" + "}" + "\n" + ".fill{" + "\n" + "    width:100%;" + "\n" + "    margin-top:10px;" + "\n" + "}" + "\n" + ".state{" + "\n" + "    color:#666;" + "\n" + "}"}});
		__add(React.createFactory('div'),{"className":'container'},function(__add){
			if (this.client.state != "connected"){
				__add(React.createFactory('div'),{"className":'alert' + " " + 'alert-warning'},function(__add){
					__add(this.client.state=="connecting"?"Verbinung wird hergestellt...":"Verbindung verloren. Erneut verbinden in "+this.client.timeUntilReconnect+"s...");
				});
			}
			__add(React.createFactory('div'),{"className":'row'},function(__add){
				__add(React.createFactory('div'),{"className":'col-sm-3' + " " + 'col-xs-12'},function(__add){
					__add("       ");
					if (client.hasPermission("officelight")){
						__add(React.createFactory('h4'),{},function(__add){
							__add("Büro Lampen");
						});
						for(var __key in this.client.devices.officelight.state.scenes){
							var scene = this.client.devices.officelight.state.scenes[__key];
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("display:flex"),"className":'fill' + " " + 'btn-group'},function(__add){
								__add(React.createFactory('div'),{"onClick":this.setScene(scene.id),"style":jade2react.mapStyle("flex:1"),"className":'btn' + " " + 'btn-default'},function(__add){
									__add(scene.name);
								});
								__add(React.createFactory('div'),{"onClick":this.deleteScene(scene.id),"className":'btn' + " " + 'btn-default'},function(__add){
									__add(React.createFactory('i'),{"className":'glyphicon' + " " + 'glyphicon-remove'});
								});
							});
						}
						__add(React.createFactory('div'),{"onClick":this.createScene.bind(this),"className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
							__add("Neue Scene");
						});
						if (this.state.createscene){
							__add(React.createFactory(Modal),{},function(__add){
								__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
									__add(React.createFactory('h2'),{},function(__add){
										__add("Scene erstellen");
									});
								});
								__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
									__add(React.createFactory('div'),{"className":'form-horizontal'},function(__add){
										__add(React.createFactory('div'),{"className":'form-group'},function(__add){
											__add(React.createFactory('label'),{"className":'col-lg-2' + " " + 'control-label'},function(__add){
												__add("Name");
											});
											__add(React.createFactory('div'),{"className":'col-lg-10'},function(__add){
												__add(React.createFactory('input'),{"type":"text","value":this.state.createscene.name,"onChange":this.validateCreateSceneName.bind(this),"className":'form-control'});
											});
										});
									});
								});
								__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
									__add(React.createFactory('div'),{"onClick":this.cancelCreateScene.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
										__add("Abbrechen");
									});
									__add(React.createFactory('div'),{"onClick":this.confirmCreateScene.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
										__add("Erfassen");
									});
								});
							});
						}
					}
				});
				__add(React.createFactory('div'),{"className":'col-sm-9' + " " + 'col-xs-12'},function(__add){
					__add(React.createFactory('div'),{"className":'row'},function(__add){
						if (client.hasPermission("mainlight")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								var state = this.client.devices.mainlight.state.status;
								__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
									__add("Lager Licht");
								});
								__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
									__add(state||"Unbekannt");
								});
								__add(React.createFactory('div'),{"onClick":this.mainlightOn.bind(this),"disabled":state=="on","className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("Voll");
								});
								__add(React.createFactory('div'),{"onClick":this.mainlightHalfOn.bind(this),"disabled":state=="half","className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("Halb");
								});
								__add(React.createFactory('div'),{"onClick":this.mainlightOff.bind(this),"disabled":state=="off","className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("Aus");
								});
							});
							this.clear([],{},1).forEach(__add);
						}
						if (client.hasPermission("workshoplight")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								var on = this.client.devices.workshoplight.state.on;               
								__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
									__add("Werkstattlicht");
								});
								__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
									__add(on!==undefined?(on?"on":"off"):"Unbekannt");
								});
								__add(React.createFactory('div'),{"onClick":this.workshopOn.bind(this),"disabled":on===true,"className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("An");
								});
								__add(React.createFactory('div'),{"onClick":this.workshopOff.bind(this),"disabled":on===false,"className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("Aus");
								});
							});
							this.clear([],{},1).forEach(__add);
						}
						if (client.hasPermission("outdoorlight")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								var state = this.client.devices.outdoorlight.state.status
								__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
									__add("Aussenlicht");
								});
								__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
									__add(state);
								});
								__add(React.createFactory('div'),{"onClick":this.outdoorlightOn.bind(this),"disabled":state=="on","className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("An");
								});
								__add(React.createFactory('div'),{"onClick":this.outdoorlightOff.bind(this),"disabled":state=="off","className":'fill' + " " + 'btn' + " " + 'btn-primary'},function(__add){
									__add("Aus");
								});
							});
							this.clear([],{},1).forEach(__add);
						}
						if (client.hasPermission("shutters")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								var state = this.client.devices.shutters.state.status
								__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
									__add("Storen");
								});
								__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
									__add(state||"Unbekannt");
								});
								__add(React.createFactory('div'),{"onClick":this.shuttersUp.bind(this),"disabled":state=="movingup","className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Hoch");
								});
								__add(React.createFactory('div'),{"onClick":this.shuttersDown.bind(this),"disabled":state=="movingdown","className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Runter");
								});
								__add(React.createFactory('div'),{"onClick":this.shuttersStop.bind(this),"disabled":state=="stopped","className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Stop");
								});
								__add(React.createFactory('div'),{"onClick":this.shuttersTilt.bind(this),"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Gekippt");
								});
							});
							this.clear([],{},1).forEach(__add);
						}
						if (client.hasPermission("gate")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								var state = this.client.devices.gate.state.state
								__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
									__add("Rolltor");
								});
								__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
									__add(state||"Unbekannt");
								});
								__add(React.createFactory('div'),{"onClick":this.gateOpen.bind(this),"disabled":state=="opening","className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Öffnen");
								});
								__add(React.createFactory('div'),{"onClick":this.gateClose.bind(this),"disabled":state=="closing","className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Schliessen");
								});
								__add(React.createFactory('div'),{"onClick":this.gateStop.bind(this),"disabled":(state=="closed"||state=="open"||state=="stopped"),"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
									__add("Stoppen");
								});
							});
							this.clear([],{},1).forEach(__add);
						}
						if (client.hasPermissions("outerdoor") || client.hasPermissions("innerdoor")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								if (client.hasPermissions("outerdoor")){
									var state = this.client.devices.outerdoor.state;
									__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
										__add("Aussentür");
									});
									__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
										__add(state.open?"offen":"zu");
									});
									__add(React.createFactory('div'),{"onClick":this.outerdoorLock.bind(this),"disabled":state.locked,"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
										__add("Verriegeln");
									});
									__add(React.createFactory('div'),{"onClick":this.outerdoorUnlock.bind(this),"disabled":!state.locked,"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
										__add("Entriegeln");
									});
								}
								if (client.hasPermissions("innerdoor")){
									var state = this.client.devices.innerdoor.state;
									__add(React.createFactory('h4'),{"className":'pull-left'},function(__add){
										__add("Innentür");
									});
									__add(React.createFactory('h4'),{"className":'state' + " " + 'pull-right'},function(__add){
										__add(state.open?"offen":"zu");
									});
									__add(React.createFactory('div'),{"onClick":this.innerdoorLock.bind(this),"disabled":state.locked,"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
										__add("Verriegeln");
									});
									__add(React.createFactory('div'),{"onClick":this.innerdoorUnlock.bind(this),"disabled":!state.locked,"className":'fill' + " " + 'btn' + " " + 'btn-success'},function(__add){
										__add("Entriegeln");
									});
								}
							});
						}
						if (client.hasPermission("sonos")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								__add(React.createFactory('h4'),{},function(__add){
									__add("Sonos");
								});
								__add(React.createFactory('div'),{"onClick":this.sonosPlay.bind(this),"className":'fill' + " " + 'btn' + " " + 'btn-warning'},function(__add){
									__add("Play");
								});
								__add(React.createFactory('div'),{"onClick":this.sonosPause.bind(this),"className":'fill' + " " + 'btn' + " " + 'btn-warning'},function(__add){
									__add("Stop");
								});
							});
						}
						if (client.hasPermissions("alloff")){
							__add(React.createFactory('div'),{"className":'col-sm-4' + " " + 'col-xs-12'},function(__add){
								__add(React.createFactory('h4'),{},function(__add){
									__add("Go Home");
								});
								__add(React.createFactory('div'),{"onClick":this.goHome.bind(this),"className":'fill' + " " + 'btn' + " " + 'btn-danger'},function(__add){
									__add("Go Home");
								});
							});
						}
					});
				});
			});
		});
	}
	clear(block,attributes,a){
		return jade2react.render(this,function(__add){
			if ((clearindex++)%3==0){
				__add(React.createFactory('div'),{"className":'clearfix' + " " + 'visible-lg' + " " + 'visible-md' + " " + 'visible-sm'});
			}
			__add(React.createFactory('div'),{"className":'clearfix' + " " + 'visible-xs'},function(__add){
				__add("       ");
			});
		});
	}
	componentWillMount(){
	    this.client = new DeviceClient();
	    this.client.on("change",function(){
	        this.update();
	    }.bind(this))
	    this.client.listen();
	}
	
	componentWillUnmount(){
	    if(this.client) this.client.disconnect();
	}
	
	getNeededPermissions(){
	    return [];
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
	
	gateOpen(){
	    this.client.devices.gate.open();
	}
	
	gateClose(){
	    this.client.devices.gate.close();
	}
	
	gateStop(){
	    this.client.devices.gate.stop();
	}
	
	createScene(){
	    this.state.createscene = {name:""};
	    this.update();
	}
	validateCreateSceneName(e){
	    this.state.createscene.name = e.target.value;
	    this.update();
	}
	cancelCreateScene(){
	    delete this.state.createscene;
	    this.update();
	}
	confirmCreateScene(){
	    var name = this.state.createscene.name;
	    delete this.state.createscene;
	    this.update();
	    this.client.devices.officelight.createScene(name);
	}
	
	setScene(id){
	    return function(){
	        this.client.devices.officelight.setScene(id);
	    }.bind(this)
	}
	
	deleteScene(id){
	    return function(){
	        this.client.devices.officelight.deleteScene(id);
	    }.bind(this)
	}    
	
	workshopOn(){
	    this.client.devices.workshoplight.turnOn();
	}
	
	workshopOff(){
	    this.client.devices.workshoplight.turnOff();
	}
	
	sonosPlay(){
	    this.client.devices.sonos.play();
	}
	
	sonosPause(){
	    this.client.devices.sonos.pause();
	}
	
	startTicTacToe(){
	    visit("/tictactoe");
	}
	
	outdoorlightOn(){
	    this.client.devices.outdoorlight.turnOn();
	}
	
	outdoorlightOff(){
	    this.client.devices.outdoorlight.turnOff();
	}
	
	outerdoorUnlock(){
	    this.client.devices.outerdoor.setAutoLock(false);
	}
	
	outerdoorLock(){
	    this.client.devices.outerdoor.setAutoLock(true);
	}
	    
	innerdoorUnlock(){
	    this.client.devices.innerdoor.setAutoLock(false);
	}
	
	innerdoorLock (){
	    this.client.devices.innerdoor.setAutoLock(true);
	}
	
	goHome(){
	    this.mainlightOff();
	    this.workshopOff();
	    this.outdoorLightOff();
	    this.outerdoorLock();
	    this.innerdoorLock();
	    this.sonosPause();
	    this.client.devices.officelight.setSceneByName("Aus");
	}
}
module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");
var Modal = require("require")("boxify/lib/views/Modal.js");
var clearindex = 0;
