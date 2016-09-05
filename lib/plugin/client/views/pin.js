"use strict";
var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;
class Component extends Base{
	_render(__add){
		__add(React.createFactory(Modal),{},function(__add){
			__add(React.createFactory('div'),{"className":'modal-header'},function(__add){
				__add(React.createFactory('h3'),{},function(__add){
					__add([this.state.pin._id.firstname||"",this.state.pin._id.lastname||""].join(" "));
				});
			});
			__add(React.createFactory('div'),{"className":'modal-body'},function(__add){
				__add(React.createFactory('div'),{"className":'form-horizontal'},function(__add){
					__add(React.createFactory('div'),{"className":"form-group "+((this.state.newPin!==undefined&&this.state.newPin.length<4)?"has-error":undefined)},function(__add){
						__add(React.createFactory('label'),{"className":'control-label' + " " + 'col-xs-2'},function(__add){
							__add("PIN");
						});
						__add(React.createFactory('div'),{"className":'col-xs-10'},function(__add){
							__add("                   ");
							__add(React.createFactory('input'),{"type":"text","ref":"pin","value":this.state.newPin||this.state.pin.pin||"","disabled":this.state.newPin===undefined,"onClick":this.editPin.bind(this),"onChange":this.onPinChanged.bind(this),"bsStyle":(this.state.newPin!==undefined&&this.state.newPin.length<4)?"error":undefined,"className":'form-control'});
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
				__add(React.createFactory('h3'),{},function(__add){
					__add("Regeln");
				});
				__add(React.createFactory('table'),{"className":'table' + " " + 'table-striped'},function(__add){
					__add(React.createFactory('tbody'),{},function(__add){
						for(var __key in this.state.pin.rules                    ){
							var rule = this.state.pin.rules                    [__key];
							__add(React.createFactory('tr'),{},function(__add){
								__add(React.createFactory('td'),{"className":'form-horizontal'},function(__add){
									__add(React.createFactory('div'),{"className":'form-group'},function(__add){
										__add(React.createFactory('label'),{"className":'input-label' + " " + 'col-lg-2'},function(__add){
											__add("Datum");
										});
										__add(React.createFactory('div'),{"style":jade2react.mapStyle("display:flex"),"className":'col-lg-10'},function(__add){
											__add(React.createFactory(DatePicker),{"style":jade2react.mapStyle("flex:1"),"time":false,"value":rule.from?new Date(rule.from):undefined,"onChange":this.onFromChanged(rule)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("display:inline-block;lineHeight:32px;paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("bis");
											});
											__add(React.createFactory(DatePicker),{"style":jade2react.mapStyle("flex:1"),"time":false,"value":rule.to?new Date(rule.to):undefined,"onChange":this.onToChanged(rule)});
										});
									});
									__add(React.createFactory('div'),{"className":'form-group'},function(__add){
										__add(React.createFactory('label'),{"className":'input-label' + " " + 'col-lg-2'},function(__add){
											__add("Zeit");
										});
										__add(React.createFactory('div'),{"style":jade2react.mapStyle("display:flex"),"className":'col-lg-10'},function(__add){
											__add(React.createFactory(DatePicker),{"style":jade2react.mapStyle("flex:1"),"calendar":false,"value":rule.timeFrom?new Date(rule.timeFrom):undefined,"onChange":this.onTimeFromChanged(rule)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("display:inline-block;lineHeight:32px;paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("bis");
											});
											__add(React.createFactory(DatePicker),{"style":jade2react.mapStyle("flex:1"),"calendar":false,"value":rule.timeTo?new Date(rule.timeTo):undefined,"onChange":this.onTimeToChanged(rule)});
										});
									});
									__add(React.createFactory('div'),{"className":'form-group'},function(__add){
										__add(React.createFactory('label'),{"className":'input-label' + " " + 'col-lg-2'},function(__add){
											__add("Wochentage");
										});
										__add(React.createFactory('div'),{"style":jade2react.mapStyle("display:flex"),"className":'col-lg-10'},function(__add){
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("M");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,0),"onChange":this.toggleDay(rule,0)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("D");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,1),"onChange":this.toggleDay(rule,1)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("M");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,2),"onChange":this.toggleDay(rule,2)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("D");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,3),"onChange":this.toggleDay(rule,3)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("F");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,4),"onChange":this.toggleDay(rule,4)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("S");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,5),"onChange":this.toggleDay(rule,5)});
											__add(React.createFactory('span'),{"style":jade2react.mapStyle("paddingLeft:10px;paddingRight:10px")},function(__add){
												__add("S");
											});
											__add(React.createFactory('input'),{"type":"checkbox","checked":this.dayEnabled(rule,6),"onChange":this.toggleDay(rule,6)});
										});
									});
								});
								__add(React.createFactory('td'),{},function(__add){
									__add(React.createFactory('div'),{"style":jade2react.mapStyle("marginTop:60px"),"onClick":this.deleteRule(rule),"className":'btn' + " " + 'btn-default'},function(__add){
										__add(React.createFactory('i'),{"className":'glyphicon' + " " + 'glyphicon-trash'});
									});
								});
							});
						}
						__add(React.createFactory('tr'),{},function(__add){
							__add(React.createFactory('td'),{"colSpan":2,"style":jade2react.mapStyle("textAlign:center")},function(__add){
								__add(React.createFactory('div'),{"onClick":this.addRule.bind(this),"className":'btn' + " " + 'btn-default' + " " + 'pull-right'},function(__add){
									__add(React.createFactory('i'),{"className":'glyphicon' + " " + 'glyphicon-plus'});
									__add(" Regel hinzufügen");
								});
							});
						});
					});
				});
			});
			__add(React.createFactory('div'),{"className":'modal-footer'},function(__add){
				__add(React.createFactory('div'),{"onClick":this.props.onClose,"className":'btn' + " " + 'btn-default'},function(__add){
					__add("Abbrechen");
				});
				__add(React.createFactory('div'),{"onClick":this.save.bind(this),"className":'btn' + " " + 'btn-primary'},function(__add){
					__add("Speichern");
				});
			});
		});
	}
	render(){
		return jade2react.render(this,this._render)[0];
	}
	constructor(props,context){
	    super(props,context);
	    this.state = {pin:this.props.pin};
	}
	
	editPin(){
	    if(this.state.newPin===undefined) this.state.newPin = this.state.pin.pin;
	    this.forceUpdate();
	    setTimeout(function(){
	        this.refs.pin.getDOMNode().getElementsByTagName("INPUT")[0].select();
	    }.bind(this))
	}
	
	onPinChanged(e){
	    this.state.newPin = e.target.value;
	    this.forceUpdate();
	}
	
	save(){
	    if(this.state.newPin && this.state.newPin.length < 4) return;
	    var data = {
	        rules:this.state.pin.rules,
	        full:this.state.pin.full
	    };
	    if(this.state.newPin) data.pin = this.state.newPin;
	    client.updatePin(this.state.pin._id._id,data,function(err){
	        this.state.pin.pin = this.state.newPin;
	        this.props.onClose();
	    }.bind(this));
	
	}
	
	onFromChanged(rule){
	    return function(date){
	        if(date){
	            rule.from = date.getTime();
	        }else{
	            delete rule.from;
	        }
	        this.forceUpdate()
	    }.bind(this)
	}
	onToChanged(rule){
	    return function(date){
	        if(date){
	            rule.to = date.getTime();
	        }else{
	            delete rule.to;
	        }
	    }.bind(this)
	}
	onTimeFromChanged(rule){
	    return function(time){
	        if(time){
	            rule.timeFrom = new Date(1970,0,1,time.getHours(),time.getMinutes()).getTime();
	        }else{
	            delete rule.timeFrom;
	        }
	        this.forceUpdate()
	    }.bind(this)
	}
	onTimeToChanged(rule){
	    return function(time){
	        if(time){
	            rule.timeTo = new Date(1970,0,1,time.getHours(),time.getMinutes()).getTime()+59999;
	        }else{
	            delete rule.timeTo;
	        }
	        this.forceUpdate()
	    }.bind(this)
	}
	
	dayEnabled(rule,day){
	    return !rule.days||!rule.days.length||rule.days.indexOf(day)>= 0;
	}
	
	toggleDay(rule,day){
	    return function(){
	        if(this.dayEnabled(rule,day)){
	            if(!rule.days||!rule.days.length) rule.days = [0,1,2,3,4,5,6];
	            rule.days.splice(rule.days.indexOf(day),1);
	            if(!rule.days.length) delete rule.days;
	        }else{
	            if(!rule.days) rule.days = [];
	            rule.days.push(day);
	            rule.days.sort();
	        }
	        this.forceUpdate();
	    }.bind(this)
	}
	
	deleteRule(rule){
	    return function(){
	        this.state.pin.rules.splice(this.state.pin.rules.indexOf(rule),1);
	        this.forceUpdate();
	    }.bind(this)
	}
	
	addRule(rule){
	    this.state.pin.rules.push({})
	    this.forceUpdate();
	}
	
	onAccessClicked(e){
	    this.state.pin.full = e.target == this.refs.full;
	    this.forceUpdate();
	}
}
module.exports = Component;

var Modal = require("require")("boxify/lib/views/Modal.js");
var client = require("../client");
var DatePicker = require("react-widgets").DateTimePicker;
var day = 1000*60*60*24;
