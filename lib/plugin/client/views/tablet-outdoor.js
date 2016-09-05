"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(React.createFactory('div'),{},function(__add){
			__add(React.createFactory('style'),{"dangerouslySetInnerHTML":{__html:"html,body{" + "\n" + "    height:100vh;" + "\n" + "    width:100vw;" + "\n" + "    margin:0px;" + "\n" + "    padding:0px;" + "\n" + "}" + "\n" + ".col-xs-9, .btn{" + "\n" + "    margin-top:20px;" + "\n" + "}" + "\n" + ".btn, html body input.form-control{" + "\n" + "    font-size:76px;" + "\n" + "    display:block;" + "\n" + "    height:10%;" + "\n" + "}" + "\n" + ".col-xs-3 .btn, .col-xs-4 .btn{" + "\n" + "    font-size:50px;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "}" + "\n" + ".modal .btn{" + "\n" + "    width:auto;" + "\n" + "    font-size:30px;" + "\n" + "}" + "\n" + "html body input.form-control{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + ""}});
			if (!client.session){
				__add(React.createFactory('div'),{"className":'col-xs-9'},function(__add){
					__add(React.createFactory('input'),{"type":"text","ref":"code","value":new Array((this.state.code||"").length+1).join("*"),"onFocus":function(e){e.target.blur()},"className":'form-control' + " " + 'block-field'});
					__add(React.createFactory('div'),{"className":'row'},function(__add){
						__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(7),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("7");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(4),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("4");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(1),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("1");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clear.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("DEL");
							});
						});
						__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(8),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("8");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(5),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("5");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(2),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("2");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(0),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("0");
							});
						});
						__add(React.createFactory('div'),{"className":'col-xs-4'},function(__add){
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(9),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("9");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(6),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("6");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.clickNum(3),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("3");
							});
							__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"),"onTouchStart":this.login.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
								__add("OK");
							});
						});
					});
				});
				__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
					__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;border:1px solid #ccc;marginTop:162px"),"onTouchStart":this.bellLight.bind(this),"className":'btn' + " " + 'btn-danger'},function(__add){
						__add("Licht");
					});
					__add(React.createFactory('div'),{"style":jade2react.mapStyle("width:100%;height:295px;border:1px solid #ccc"),"onTouchStart":this.bellRing.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
						__add(React.createFactory('i'),{"style":jade2react.mapStyle("lineHeight:260px"),"className":'glyphicon' + " " + 'glyphicon-bell'});
					});
				});
			}else{
				if (client.hasPermission("gate")){
					__add(React.createFactory('div'),{"className":'col-xs-12'},function(__add){
						__add(React.createFactory('h1'),{},function(__add){
							__add("Willkommen, "+client.session.user.firstname+" "+client.session.user.lastname);
						});
					});
					__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
						if (client.hasPermission("gate")){
							__add(React.createFactory('h1'),{},function(__add){
								__add("Tor");
							});
							__add(React.createFactory('div'),{"onTouchStart":this.openGate.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
								__add("Öffnen");
							});
							__add(React.createFactory('div'),{"onTouchStart":this.stopGate.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
								__add("Stoppen");
							});
							__add(React.createFactory('div'),{"onTouchStart":this.closeGate.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
								__add("Schliessen");
							});
						}
					});
					__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
						if (client.hasPermission("outdoorlight")){
							__add(React.createFactory('h1'),{},function(__add){
								__add("Aussenlicht");
							});
							__add(React.createFactory('div'),{"onTouchStart":this.outdoorlightOn.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
								__add("An");
							});
							__add(React.createFactory('div'),{"onTouchStart":this.outdoorlightOff.bind(this),"className":'btn' + " " + 'btn-success'},function(__add){
								__add("Aus");
							});
						}
					});
					__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
						__add(React.createFactory('h1'),{},function(__add){
							__add("Türen");
						});
						__add(React.createFactory('div'),{"onClick":this.lockDoors.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
							__add("Verriegeln");
						});
						__add(React.createFactory('div'),{"onClick":this.unlockDoors.bind(this),"className":'btn' + " " + 'btn-warning'},function(__add){
							__add("Entriegeln");
						});
					});
					__add(React.createFactory('div'),{"className":'col-xs-3'},function(__add){
						if (client.hasPermission("alloff")){
							__add(React.createFactory('h1'),{},function(__add){
								__add("Feierabend");
							});
							__add(React.createFactory('div'),{"onClick":this.allOff.bind(this),"className":'btn' + " " + 'btn-danger'},function(__add){
								__add("Go Home");
							});
						}
					});
				}else{
					__add(React.createFactory('div'),{"style":jade2react.mapStyle("height:100%;line-height:800px;text-align:center;font-size:100px")},function(__add){
						__add("Bitte eintreten");
					});
				}
			}
			if (this.state.showPinError){
				__add(React.createFactory(Modal),{},function(__add){
					__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
						__add(React.createFactory('h2'),{},function(__add){
							__add("Die eingegebene PIN ist ungültig!");
						});
					});
					__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
						__add(React.createFactory('button'),{"onClick":this.closePinError.bind(this),"className":'btn' + " " + 'btn-primary' + " " + 'pull-right'},function(__add){
							__add("Nochmals probieren");
						});
					});
				});
			}
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	constructor(props,context){
	    super(props,context);
	    this.state = {};
	}    
	componentWillMount(){
	    var self = this;
	    if(client.session){
	        client.deleteSession(function(){
	            self.forceUpdate();
	        });
	    }
	    this.client = new DeviceClient();
	}
	
	clickNum(num){
	    var self = this;
	    return function(e){
	        self.state.code = (self.state.code||"")+num;
	        e.target.blur()
	        self.forceUpdate();
	    }
	}
	clear(){
	    this.state.code = "";
	    this.forceUpdate();
	}
	
	login (){
	    var self = this;
	    cli.login(this.state.code,function(err){
	        self.state.code = "";
	        if(err){
	            self.state.showPinError = true;
	            self.forceUpdate();
	            return;
	        }
	        if(client.hasPermission("outerdoor")) self.client.devices.outerdoor.setLocked(false);
	        if(client.hasPermission("innerdoor")) setTimeout(function(){self.client.devices.innerdoor.setLocked(false);},2000);
	        self.forceUpdate();
	        logoutTimeout = setTimeout(function(){
	            client.deleteSession(function(){
	                self.forceUpdate();
	            })
	        },30000);
	    })
	}
	
	openGate(){
	    this.client.devices.gate.open();
	}
	
	stopGate(){
	    this.client.devices.gate.stop();
	}
	
	closeGate(){
	    this.client.devices.gate.close();
	}
	
	allOff(){
	    this.client.devices.alloff.off();
	}
	
	outdoorlightOn(){
	    this.client.devices.outdoorlight.turnOn();
	}
	
	outdoorlightOff(){
	    this.client.devices.outdoorlight.turnOff();
	}
	
	closePinError(){
	    delete this.state.showPinError;
	    this.forceUpdate();
	}
	
	lockDoors(){
	    if(client.hasPermission("innerdoor")) this.client.devices.innerdoor.setAutoLock(true);
	    if(client.hasPermission("outerdoor")) this.client.devices.outerdoor.setAutoLock(true);
	}
	
	unlockDoors(){
	    if(client.hasPermission("innerdoor")) this.client.devices.innerdoor.setAutoLock(false);
	    if(client.hasPermission("outerdoor")) this.client.devices.outerdoor.setAutoLock(false);
	}
	
	bellRing(){
	    this.client.devices.bell.ring();
	}
	
	bellLight(){
	    this.client.devices.bell.light();
	}
}
module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");
var Modal = require("require")("boxify/lib/views/Modal.js");
var cli = require("../client");

var logoutTimeout;
