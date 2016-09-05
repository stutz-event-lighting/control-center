"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(React.createFactory('div'),{"className":'row'},function(__add){
			__add(React.createFactory('div'),{"className":'col-xs-12'},function(__add){
				__add(React.createFactory('h2'),{},function(__add){
					__add("PIN");
					__add(React.createFactory('div'),{"className":'btn-toolbar'},function(__add){
						__add(React.createFactory('div'),{"onClick":this.changePin.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
							__add("PIN ändern");
						});
					});
				});
			});
			if (this.state.changepin){
				__add(React.createFactory(Modal),{},function(__add){
					__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
						__add(React.createFactory('h2'),{},function(__add){
							__add("PIN ändern");
						});
					});
					__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
						__add(React.createFactory('div'),{"className":'form-horizontal'},function(__add){
							__add(React.createFactory('div'),{"className":'form-group'},function(__add){
								__add(React.createFactory('label'),{"className":'col-lg-2' + " " + 'control-label'},function(__add){
									__add("Neue PIN");
								});
								__add(React.createFactory('div'),{"className":'col-lg-10'},function(__add){
									__add(React.createFactory('input'),{"type":"password","value":this.state.changepin.pin,"onChange":this.onPinChanged.bind(this),"className":'form-control'});
								});
							});
						});
					});
					__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
						__add(React.createFactory('button'),{"onClick":this.cancelChangePin.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
							__add("Abbrechen");
						});
						__add(React.createFactory('button'),{"onClick":this.confirmChangePin.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
							__add("Speichern");
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
	changePin(){
	    this.state.changepin = {pin:""};
	    this.forceUpdate();
	}
	
	onPinChanged(e){
	    this.state.changepin.pin = e.target.value;
	    this.forceUpdate();
	}
	
	cancelChangePin(){
	    delete this.state.changepin;
	    this.forceUpdate();
	}
	
	confirmChangePin(){
	    if(!this.state.changepin.pin.length) return alert("Bitte geben Sie eine neue PIN ein");
	    client.updatePin(this.props.user,{pin:this.state.changepin.pin},function(err){
	        delete this.state.changepin;
	        this.forceUpdate();
	    }.bind(this));
	}
}
module.exports = Component;

var client = require("../client");
var Modal = require("require")("boxify/lib/views/Modal.js");
