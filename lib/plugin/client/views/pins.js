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
		__add(React.createFactory('div'),{"className":'container'},function(__add){
			__add(React.createFactory('h1'),{},function(__add){
				__add("Zugänge");
			});
			__add(React.createFactory('button'),{"onClick":this.create.bind(this),"className":'btn' + " " + 'btn-primary' + " " + 'pull-right'},function(__add){
				__add("Erstellen");
			});
			__add(React.createFactory('table'),{"className":'table' + " " + 'table-striped'},function(__add){
				__add(React.createFactory('thead'),{},function(__add){
					__add(React.createFactory('tr'),{},function(__add){
						__add(React.createFactory('th'),{},function(__add){
							__add("Kontakt");
						});
						__add(React.createFactory('th'),{},function(__add){
							__add("Gültigkeit");
						});
					});
				});
				__add(React.createFactory('tbody'),{},function(__add){
					for(var __key in this.state.pins){
						var pin = this.state.pins[__key];
						__add(React.createFactory('tr'),{"onClick":this.editPin(pin)},function(__add){
							__add(React.createFactory('td'),{},function(__add){
								__add([pin._id.firstname||"",pin._id.lastname||""].join(" "));
							});
							__add(React.createFactory('td'),{},function(__add){
								__add(React.createFactory('button'),{"onClick":this.delete(pin),"className":'btn' + " " + 'btn-xs' + " " + 'btn-default' + " " + 'pull-right'},function(__add){
									__add(React.createFactory('i'),{"className":'glyphicon' + " " + 'glyphicon-trash'});
								});
								if (!pin.rules.length){
									__add(React.createFactory('div'),{},function(__add){
										__add("Immer");
									});
								}
								for(var __key in pin.rules){
									var rule = pin.rules[__key];
									__add(React.createFactory('div'),{},function(__add){
										__add(this.renderRule(rule));
									});
								}
							});
						});
					}
				});
			});
		});
		if (this.state.pin){
			__add(React.createFactory(Modal),{},function(__add){
				__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
					__add(React.createFactory('h2'),{},function(__add){
						__add("Zugang erstellen");
					});
				});
				__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
					__add(React.createFactory('div'),{"className":'form-horizontal'},function(__add){
						__add(React.createFactory('div'),{"className":'form-group'},function(__add){
							__add(React.createFactory('label'),{"className":'col-xs-2' + " " + 'control-label'},function(__add){
								__add("Kontakt");
							});
							__add(React.createFactory('div'),{"className":'col-xs-10'},function(__add){
								__add(React.createFactory(ContactBox),{"value":this.state.pin._id&&this.state.pin._id._id,"onChange":this.onPersonChanged.bind(this),"type":"person"});
							});
						});
						__add(React.createFactory('div'),{"className":"form-group "+(this.state.pin.pin.length < 4?"has-error":undefined)},function(__add){
							__add(React.createFactory('label'),{"className":'col-xs-2' + " " + 'control-label'},function(__add){
								__add("PIN");
							});
							__add(React.createFactory('div'),{"className":'col-xs-10'},function(__add){
								__add(React.createFactory('input'),{"type":"text","value":this.state.pin.pin,"onChange":this.onPinChanged.bind(this),"className":'form-control'});
							});
						});
						__add(React.createFactory('div'),{"className":'form-group'},function(__add){
							__add(React.createFactory('label'),{"className":'col-xs-2' + " " + 'control-label'},function(__add){
								__add("Zugang");
							});
							__add(React.createFactory('div'),{"className":'col-xs-10' + " " + 'checkbox'},function(__add){
								__add(React.createFactory('label'),{},function(__add){
									__add(React.createFactory('input'),{"type":"radio","checked":!this.state.pin.full,"onClick":this.onAccessClicked.bind(this),"ref":"half"});
									__add(" Abhollager");
								});
								__add(React.createFactory('label'),{},function(__add){
									__add(React.createFactory('input'),{"type":"radio","checked":this.state.pin.full,"onClick":this.onAccessClicked.bind(this),"ref":"full"});
									__add(" Vollzugang");
								});
							});
						});
					});
				});
				__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
					__add(React.createFactory('button'),{"onClick":this.cancel.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
						__add("Abbrechen");
					});
					__add(React.createFactory('button'),{"onClick":this.confirm.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
						__add("Erstellen");
					});
				});
			});
		}
		if (this.state.editPin){
			__add(React.createFactory(Pin),{"pin":this.state.editPin,"onClose":this.closePin.bind(this)});
		}
		if (this.state.delete){
			__add(React.createFactory(Modal),{},function(__add){
				__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
					__add(React.createFactory('h2'),{},function(__add){
						__add("Zugang löschen");
					});
				});
				__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
					__add("Möchten Sie den Zugang für");
					__add(React.createFactory('b'),{},function(__add){
						__add(" "+[this.state.delete._id.firstname||"",this.state.delete._id.lastname||""].join(" "));
					});
					__add(" wirklich löschen?");
				});
				__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
					__add(React.createFactory('button'),{"onClick":this.cancel.bind(this),"className":'btn' + " " + 'btn-default'},function(__add){
						__add("Abbrechen");
					});
					__add(React.createFactory('button'),{"onClick":this.confirm.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
						__add("Löschen");
					});
				});
			});
		}
	}
	componentDidMount(){
	    if(!this.state.pins) this.loadData();
	}
	
	loadData(){
	    client.getPins(function(err,pins){
	        this.state.pins = pins;
	        this.update();
	    }.bind(this));
	}  
	
	create(){
	    this.state.pin = {_id:null,pin:"",full:false};
	    this.update();
	}
	
	onPersonChanged(person){
	    this.state.pin._id = {_id:person};
	    this.update();
	}
	
	onPinChanged(e){
	    this.state.pin.pin = e.target.value;
	    this.update();
	}
	
	cancel(){
	    delete this.state.pin;
	    delete this.state.delete;
	    this.update();
	}
	
	delete(pin){
	    return function(){
	        this.state.delete = pin;
	        this.update();
	    }.bind(this)
	}
	
	confirm(){
	    if(this.state.pin){
	        client.createPin({contact:this.state.pin._id._id,pin:this.state.pin.pin,full:this.state.pin.full},function(){
	            delete this.state.pin;
	            this.loadData();
	        }.bind(this))
	    }else if(this.state.delete){
	        client.deletePin(this.state.delete._id._id,function(){
	            delete this.state.delete;
	            this.loadData();
	        }.bind(this))
	    }
	}    
	
	renderRule(rule){
	    var entries = [];
	    
	    if(rule.from&&rule.to){
	        entries.push(moment(rule.from).format("LL")+" - "+moment(rule.to).format("LL"));
	    }else if(rule.from){
	        entries.push("ab "+moment(rule.from).format("LL"));
	    }else if(rule.to){
	        entries.push("bis "+moment(rule.to).format("LL"));
	    }
	    
	    if(rule.timeFrom !== undefined || rule.timeTo!==undefined){
	        entries.push(moment(rule.timeFrom!==undefined?rule.timeFrom:defaultTimeFrom).format("LT")+" - "+moment(rule.timeTo!==undefined?rule.timeTo:defaultTimeTo).format("LT"));
	    }
	    if(rule.days && rule.days.length < 7){
	        for(var i = 0; rule.days && i < rule.days.length; i++){
	            for(var j = 1; j < rule.days.length-i && rule.days[i+j] == rule.days[i]+j; j++);
	            j--;
	            if(j >= 1){
	                entries.push(days[rule.days[i]]+"-"+days[rule.days[i]+j]);
	                i += j;
	            }else{
	                entries.push(days[rule.days[i]]);
	            }
	        }
	    }
	    
	    if(!entries.length) entries.push("Immer");
	    return entries.join(", ");
	}
	
	editPin(pin){
	    return function(e){
	        if(e.target.tagName == "I" || e.target.tagName == "BUTTON") return;
	        this.state.editPin = JSON.parse(JSON.stringify(pin));
	        this.update();
	    }.bind(this)
	}
	
	closePin(){
	    delete this.state.editPin;
	    this.loadData();
	}
	
	onAccessClicked(e){
	    this.state.pin.full = e.target == this.refs.full;
	    this.forceUpdate();
	}
}
module.exports = Component;

var client = require("../client");
var Modal = require("require")("boxify/lib/views/Modal.js");
var ContactBox = require("require")("boxify/lib/views/ContactBox.js");
var moment = require("moment");
var Pin = require("./pin");
var days = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
var defaultTimeFrom = new Date(1970,0,1,0,0,0).getTime();
var defaultTimeTo = new Date(1970,0,1,23,59,59,999).getTime();
