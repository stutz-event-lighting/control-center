"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(React.createFactory('div'),{},function(__add){
			if (this.needsLogin()){
				__add(React.createFactory('h1'),{},function(__add){
					__add("Login Benötigt");
				});
				__add(React.createFactory('div'),{"className":'form-horizontal'},function(__add){
					__add(React.createFactory('div'),{"className":'form-group'},function(__add){
						__add(React.createFactory('label'),{"className":'col-lg-2' + " " + 'control-label'},function(__add){
							__add("E-Mail");
						});
						__add(React.createFactory('div'),{"className":'col-lg-10'},function(__add){
							__add(React.createFactory('input'),{"type":"text","value":this.state.email||"","onChange":this.onMailChanged.bind(this),"className":'form-control'});
						});
					});
					__add(React.createFactory('div'),{"className":'form-group'},function(__add){
						__add(React.createFactory('label'),{"className":'col-lg-2' + " " + 'control-label'},function(__add){
							__add("Passwort");
						});
						__add(React.createFactory('div'),{"className":'col-lg-10'},function(__add){
							__add(React.createFactory('input'),{"type":"password","value":this.state.password||"","onChange":this.onPasswordChanged.bind(this),"className":'form-control'});
						});
					});
				});
				__add(React.createFactory('div'),{"onClick":this.login.bind(this),"className":'btn' + " " + 'btn-primary' + " " + 'pull-right'},function(__add){
					__add("Anmelden");
				});
			}else{
				if (this.listen && this.client.state != "connected"){
					__add(React.createFactory('div'),{"className":'alert' + " " + 'alert-warning'},function(__add){
						__add(this.client.state=="connecting"?"Verbinung wird hergestellt...":"Verbindung verloren. Erneut verbinden in "+this.client.timeUntilReconnect+"s...");
					});
				}
				this.content(__add);
			}
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	content(__add){
	}
	constructor(props,context){
	    super(props,context);
	    this.state = {};
	}
	
	needsLogin(){
	    var needed = this.getNeededPermissions();
	    for(var i = 0; i< needed.length; i++){
	        if(!client.hasPermission(needed[i])) return true;
	    }
	    return false;
	}
	
	getNeededPermissions(){
	    return [];
	}   
	
	componentWillUnmount(){
	    this.client.disconnect();
	}
	
	onMailChanged(e){
	    this.state.email = e.target.value;
	    this.forceUpdate();
	}
	
	onPasswordChanged(e){
	    this.state.password = e.target.value;
	    this.forceUpdate();
	}
	
	login(){
	    var self = this;
	    if(!this.state.email || !this.state.password) return;
	    client.createSession({email:this.state.email,password:this.state.password},function(err,sessionid){
	        if(err) return alert("Login fehlgeschlagen!");
	        self.forceUpdate();
	    });
	}
	
	componentWillMount(){ 
	    this.client = new DeviceClient();
	    this.client.on("change",function(){
	        this.forceUpdate();
	    }.bind(this))
	    if(this.listen) this.client.listen();
	}
	
	componentWillUnmount(){
	    this.client.disconnect();
	}
}
module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");
