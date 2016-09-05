require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/control-center/lib/devices.js":[function(require,module,exports){
"use strict";

module.exports = {
    "alloff": { name: "Go Home Button", commands: ["off"] },
    "shutters": { name: "Storen", commands: ["stop", "moveUp", "moveDown", "tilt"] },
    "mainlight": { name: "Hauptlicht", commands: ["turnOn", "turnHalfOn", "turnOff"] },
    "gate": { name: "Rolltor", commands: ["open", "close", "stop"] },
    "outerdoor": { name: "Aussentür", commands: ["setLocked", "setAutoLock"] },
    "innerdoor": { name: "Innentür", commands: ["setLocked", "setAutoLock"] },
    "officelight": { name: "Bürolicht", commands: ["createScene", "setScene", "setSceneByName", "deleteScene"] },
    "tictactoe": { name: "Tic Tac Toe", commands: ["turn"] },
    "outdoorlight": { name: "Aussenlicht", commands: ["turnOn", "turnOff"] },
    "workshoplight": { name: "Werkstattlicht", commands: ["turnOn", "turnOff"] },
    "sonos": { name: "Sonos", commands: ["play", "pause"] },
    "bell": { name: "Bell", commands: ["ring", "light"], public: true }
};

},{}],"/control-center/lib/node_modules/boxify/lib/views/base.js":[function(require,module,exports){
module.exports = require("require")("boxify/lib/views/base.js");

},{"require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/node_modules/react-widgets.js":[function(require,module,exports){
module.exports = require("require")("boxify/node_modules/react-widgets/lib/index.js");

},{"require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/node_modules/react.js":[function(require,module,exports){
module.exports = require("require")("boxify/node_modules/react/react.js");

},{"require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/node_modules/require.js":[function(require,module,exports){
module.exports = function(path){
	return require(typeof window == "undefined"?path:"/"+path);
}

},{}],"/control-center/lib/plugin/client/client.js":[function(require,module,exports){
"use strict";

var client = require("require")("boxify/lib/client.js");
var cookie = require("cookies-js");

module.exports = new Client();

function Client() {}
Client.prototype.createPin = function (data, cb) {
    client.fetch("/api/pins/create", JSON.stringify({ _id: data.contect, pin: data.pin, full: data.full }), cb);
};
Client.prototype.getPins = function (cb) {
    client.fetchJSON("/api/pins", JSON.stringify({}), cb);
};
Client.prototype.updatePin = function (id, data, cb) {
    client.fetch("/api/pins/" + id + "/update", JSON.stringify(data), cb);
};
Client.prototype.deletePin = function (id, cb) {
    client.fetch("/api/pins/" + id + "/delete", null, cb);
};
Client.prototype.login = function (pin, cb) {
    client.fetchJSON("/api/pins/login", JSON.stringify({ pin: pin }), function (err, session) {
        if (err) return cb(err);
        cookie.set("session", session._id, { expires: 60 * 60 * 24 * 365 * 100 });
        client.getSession(cb);
    });
};

var menu = require("require")("boxify/lib/views/menu.js").menu;
menu.Elektronik = { url: "/electronic", loggedIn: true };
menu.Zugänge = { url: "/pins", loggedIn: true };

require("require")("boxify/lib/views/profile.js").extensionSections.push(require("./views/PinSection"));

},{"./views/PinSection":"/control-center/lib/plugin/client/views/PinSection.js","cookies-js":"/control-center/node_modules/cookies-js/dist/cookies.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/client/device.js":[function(require,module,exports){
"use strict";

var devices = require("../../../devices");

var Device = module.exports = function Device(name) {
    this.name = name;
    this.state = {};
    var commands = devices[name].commands;
    for (var i = 0; i < commands.length; i++) {
        (function (command) {
            this[command] = function () {
                var req = new XMLHttpRequest();
                req.open("POST", "/api/electronic/" + name + "/" + command);
                req.setRequestHeader("Content-Type", "application/json");
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        //done
                    }
                };
                req.send(JSON.stringify(Array.prototype.slice.call(arguments)));
            };
        }).bind(this)(commands[i]);
    }
};

Device.prototype.updateState = function (state) {
    this.state = state;
};

},{"../../../devices":"/control-center/lib/devices.js"}],"/control-center/lib/plugin/client/client/index.js":[function(require,module,exports){
"use strict";

var EventEmitter = require("events").EventEmitter;
var Device = require("./device");
var devices = require("../../../devices");

var DeviceClient = module.exports = function DeviceClient() {
    EventEmitter.call(this);
    this.state = "disconnected";
    this.devices = {};
    for (var device in devices) {
        this.devices[device] = new Device(device);
    }
    this.autoreconnect = false;
};

DeviceClient.prototype = Object.create(EventEmitter.prototype);

DeviceClient.prototype.listen = function () {
    clearTimeout(this.timeout);
    this.autoreconnect = true;
    this.state = "connecting";
    delete this.timeUntilReconnect;
    this.socket = new WebSocket("ws://" + location.host + "/api/electronic");
    this.emit("change");

    this.socket.onopen = function () {
        this.state = "connected";
        this.emit("change");
    }.bind(this);
    this.socket.onmessage = function (msg) {
        var states = JSON.parse(msg.data);
        for (var device in states) {
            this.devices[device].updateState(states[device]);
        }this.emit("change");
    }.bind(this);
    this.socket.onclose = function () {
        this.state = "disconnected";
        this.timeUntilReconnect = 5;
        this.emit("change");
        if (this.autoreconnect) setTimeout(this.countDownReconnect.bind(this), 1000);
    }.bind(this);
};

DeviceClient.prototype.countDownReconnect = function () {
    this.timeUntilReconnect--;
    if (this.timeUntilReconnect <= 0) {
        this.listen();
    } else {
        this.emit("change");
        setTimeout(this.countDownReconnect.bind(this), 1000);
    }
};

DeviceClient.prototype.disconnect = function () {
    this.autoreconnect = false;
    if (this.state != "disconnected") this.socket.close();
};

},{"../../../devices":"/control-center/lib/devices.js","./device":"/control-center/lib/plugin/client/client/device.js","events":"/control-center/node_modules/events/events.js"}],"/control-center/lib/plugin/client/index.js":[function(require,module,exports){
"use strict";

require("../routes");

},{"../routes":"/control-center/lib/plugin/routes.js"}],"/control-center/lib/plugin/client/views/PinSection.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			__add(React.createFactory('div'), { "className": 'row' }, function (__add) {
				__add(React.createFactory('div'), { "className": 'col-xs-12' }, function (__add) {
					__add(React.createFactory('h2'), {}, function (__add) {
						__add("PIN");
						__add(React.createFactory('div'), { "className": 'btn-toolbar' }, function (__add) {
							__add(React.createFactory('div'), { "onClick": this.changePin.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
								__add("PIN ändern");
							});
						});
					});
				});
				if (this.state.changepin) {
					__add(React.createFactory(Modal), {}, function (__add) {
						__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
							__add(React.createFactory('h2'), {}, function (__add) {
								__add("PIN ändern");
							});
						});
						__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
							__add(React.createFactory('div'), { "className": 'form-horizontal' }, function (__add) {
								__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
									__add(React.createFactory('label'), { "className": 'col-lg-2' + " " + 'control-label' }, function (__add) {
										__add("Neue PIN");
									});
									__add(React.createFactory('div'), { "className": 'col-lg-10' }, function (__add) {
										__add(React.createFactory('input'), { "type": "password", "value": this.state.changepin.pin, "onChange": this.onPinChanged.bind(this), "className": 'form-control' });
									});
								});
							});
						});
						__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
							__add(React.createFactory('button'), { "onClick": this.cancelChangePin.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
								__add("Abbrechen");
							});
							__add(React.createFactory('button'), { "onClick": this.confirmChangePin.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
								__add("Speichern");
							});
						});
					});
				}
			});
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.state = {};
		return _this;
	}

	_createClass(Component, [{
		key: "changePin",
		value: function changePin() {
			this.state.changepin = { pin: "" };
			this.forceUpdate();
		}
	}, {
		key: "onPinChanged",
		value: function onPinChanged(e) {
			this.state.changepin.pin = e.target.value;
			this.forceUpdate();
		}
	}, {
		key: "cancelChangePin",
		value: function cancelChangePin() {
			delete this.state.changepin;
			this.forceUpdate();
		}
	}, {
		key: "confirmChangePin",
		value: function confirmChangePin() {
			if (!this.state.changepin.pin.length) return alert("Bitte geben Sie eine neue PIN ein");
			client.updatePin(this.props.user, { pin: this.state.changepin.pin }, function (err) {
				delete this.state.changepin;
				this.forceUpdate();
			}.bind(this));
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var client = require("../client");
var Modal = require("require")("boxify/lib/views/Modal.js");

},{"../client":"/control-center/lib/plugin/client/client.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/electronic.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = require("boxify/lib/views/base");

var Component = function (_Base) {
	_inherits(Component, _Base);

	function Component() {
		_classCallCheck(this, Component);

		return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).apply(this, arguments));
	}

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "_render", this).call(this, __add);
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "body",
		value: function body(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "body", this).call(this, __add);
			clearindex = 1;
			__add(React.createFactory('style'), { "dangerouslySetInnerHTML": { __html: "h4{" + "\n" + "    margin-top:30px;" + "\n" + "    margin-bottom:0px;" + "\n" + "}" + "\n" + ".fill{" + "\n" + "    width:100%;" + "\n" + "    margin-top:10px;" + "\n" + "}" + "\n" + ".state{" + "\n" + "    color:#666;" + "\n" + "}" } });
			__add(React.createFactory('div'), { "className": 'container' }, function (__add) {
				if (this.client.state != "connected") {
					__add(React.createFactory('div'), { "className": 'alert' + " " + 'alert-warning' }, function (__add) {
						__add(this.client.state == "connecting" ? "Verbinung wird hergestellt..." : "Verbindung verloren. Erneut verbinden in " + this.client.timeUntilReconnect + "s...");
					});
				}
				__add(React.createFactory('div'), { "className": 'row' }, function (__add) {
					__add(React.createFactory('div'), { "className": 'col-sm-3' + " " + 'col-xs-12' }, function (__add) {
						__add("       ");
						if (client.hasPermission("officelight")) {
							__add(React.createFactory('h4'), {}, function (__add) {
								__add("Büro Lampen");
							});
							for (var __key in this.client.devices.officelight.state.scenes) {
								var scene = this.client.devices.officelight.state.scenes[__key];
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("display:flex"), "className": 'fill' + " " + 'btn-group' }, function (__add) {
									__add(React.createFactory('div'), { "onClick": this.setScene(scene.id), "style": jade2react.mapStyle("flex:1"), "className": 'btn' + " " + 'btn-default' }, function (__add) {
										__add(scene.name);
									});
									__add(React.createFactory('div'), { "onClick": this.deleteScene(scene.id), "className": 'btn' + " " + 'btn-default' }, function (__add) {
										__add(React.createFactory('i'), { "className": 'glyphicon' + " " + 'glyphicon-remove' });
									});
								});
							}
							__add(React.createFactory('div'), { "onClick": this.createScene.bind(this), "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
								__add("Neue Scene");
							});
							if (this.state.createscene) {
								__add(React.createFactory(Modal), {}, function (__add) {
									__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
										__add(React.createFactory('h2'), {}, function (__add) {
											__add("Scene erstellen");
										});
									});
									__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
										__add(React.createFactory('div'), { "className": 'form-horizontal' }, function (__add) {
											__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
												__add(React.createFactory('label'), { "className": 'col-lg-2' + " " + 'control-label' }, function (__add) {
													__add("Name");
												});
												__add(React.createFactory('div'), { "className": 'col-lg-10' }, function (__add) {
													__add(React.createFactory('input'), { "type": "text", "value": this.state.createscene.name, "onChange": this.validateCreateSceneName.bind(this), "className": 'form-control' });
												});
											});
										});
									});
									__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
										__add(React.createFactory('div'), { "onClick": this.cancelCreateScene.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
											__add("Abbrechen");
										});
										__add(React.createFactory('div'), { "onClick": this.confirmCreateScene.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
											__add("Erfassen");
										});
									});
								});
							}
						}
					});
					__add(React.createFactory('div'), { "className": 'col-sm-9' + " " + 'col-xs-12' }, function (__add) {
						__add(React.createFactory('div'), { "className": 'row' }, function (__add) {
							if (client.hasPermission("mainlight")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									var state = this.client.devices.mainlight.state.status;
									__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
										__add("Lager Licht");
									});
									__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
										__add(state || "Unbekannt");
									});
									__add(React.createFactory('div'), { "onClick": this.mainlightOn.bind(this), "disabled": state == "on", "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("Voll");
									});
									__add(React.createFactory('div'), { "onClick": this.mainlightHalfOn.bind(this), "disabled": state == "half", "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("Halb");
									});
									__add(React.createFactory('div'), { "onClick": this.mainlightOff.bind(this), "disabled": state == "off", "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("Aus");
									});
								});
								this.clear([], {}, 1).forEach(__add);
							}
							if (client.hasPermission("workshoplight")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									var on = this.client.devices.workshoplight.state.on;
									__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
										__add("Werkstattlicht");
									});
									__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
										__add(on !== undefined ? on ? "on" : "off" : "Unbekannt");
									});
									__add(React.createFactory('div'), { "onClick": this.workshopOn.bind(this), "disabled": on === true, "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("An");
									});
									__add(React.createFactory('div'), { "onClick": this.workshopOff.bind(this), "disabled": on === false, "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("Aus");
									});
								});
								this.clear([], {}, 1).forEach(__add);
							}
							if (client.hasPermission("outdoorlight")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									var state = this.client.devices.outdoorlight.state.status;
									__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
										__add("Aussenlicht");
									});
									__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
										__add(state);
									});
									__add(React.createFactory('div'), { "onClick": this.outdoorlightOn.bind(this), "disabled": state == "on", "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("An");
									});
									__add(React.createFactory('div'), { "onClick": this.outdoorlightOff.bind(this), "disabled": state == "off", "className": 'fill' + " " + 'btn' + " " + 'btn-primary' }, function (__add) {
										__add("Aus");
									});
								});
								this.clear([], {}, 1).forEach(__add);
							}
							if (client.hasPermission("shutters")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									var state = this.client.devices.shutters.state.status;
									__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
										__add("Storen");
									});
									__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
										__add(state || "Unbekannt");
									});
									__add(React.createFactory('div'), { "onClick": this.shuttersUp.bind(this), "disabled": state == "movingup", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Hoch");
									});
									__add(React.createFactory('div'), { "onClick": this.shuttersDown.bind(this), "disabled": state == "movingdown", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Runter");
									});
									__add(React.createFactory('div'), { "onClick": this.shuttersStop.bind(this), "disabled": state == "stopped", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Stop");
									});
									__add(React.createFactory('div'), { "onClick": this.shuttersTilt.bind(this), "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Gekippt");
									});
								});
								this.clear([], {}, 1).forEach(__add);
							}
							if (client.hasPermission("gate")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									var state = this.client.devices.gate.state.state;
									__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
										__add("Rolltor");
									});
									__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
										__add(state || "Unbekannt");
									});
									__add(React.createFactory('div'), { "onClick": this.gateOpen.bind(this), "disabled": state == "opening", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Öffnen");
									});
									__add(React.createFactory('div'), { "onClick": this.gateClose.bind(this), "disabled": state == "closing", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Schliessen");
									});
									__add(React.createFactory('div'), { "onClick": this.gateStop.bind(this), "disabled": state == "closed" || state == "open" || state == "stopped", "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
										__add("Stoppen");
									});
								});
								this.clear([], {}, 1).forEach(__add);
							}
							if (client.hasPermissions("outerdoor") || client.hasPermissions("innerdoor")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									if (client.hasPermissions("outerdoor")) {
										var state = this.client.devices.outerdoor.state;
										__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
											__add("Aussentür");
										});
										__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
											__add(state.open ? "offen" : "zu");
										});
										__add(React.createFactory('div'), { "onClick": this.outerdoorLock.bind(this), "disabled": state.locked, "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
											__add("Verriegeln");
										});
										__add(React.createFactory('div'), { "onClick": this.outerdoorUnlock.bind(this), "disabled": !state.locked, "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
											__add("Entriegeln");
										});
									}
									if (client.hasPermissions("innerdoor")) {
										var state = this.client.devices.innerdoor.state;
										__add(React.createFactory('h4'), { "className": 'pull-left' }, function (__add) {
											__add("Innentür");
										});
										__add(React.createFactory('h4'), { "className": 'state' + " " + 'pull-right' }, function (__add) {
											__add(state.open ? "offen" : "zu");
										});
										__add(React.createFactory('div'), { "onClick": this.innerdoorLock.bind(this), "disabled": state.locked, "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
											__add("Verriegeln");
										});
										__add(React.createFactory('div'), { "onClick": this.innerdoorUnlock.bind(this), "disabled": !state.locked, "className": 'fill' + " " + 'btn' + " " + 'btn-success' }, function (__add) {
											__add("Entriegeln");
										});
									}
								});
							}
							if (client.hasPermission("sonos")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									__add(React.createFactory('h4'), {}, function (__add) {
										__add("Sonos");
									});
									__add(React.createFactory('div'), { "onClick": this.sonosPlay.bind(this), "className": 'fill' + " " + 'btn' + " " + 'btn-warning' }, function (__add) {
										__add("Play");
									});
									__add(React.createFactory('div'), { "onClick": this.sonosPause.bind(this), "className": 'fill' + " " + 'btn' + " " + 'btn-warning' }, function (__add) {
										__add("Stop");
									});
								});
							}
							if (client.hasPermissions("alloff")) {
								__add(React.createFactory('div'), { "className": 'col-sm-4' + " " + 'col-xs-12' }, function (__add) {
									__add(React.createFactory('h4'), {}, function (__add) {
										__add("Go Home");
									});
									__add(React.createFactory('div'), { "onClick": this.goHome.bind(this), "className": 'fill' + " " + 'btn' + " " + 'btn-danger' }, function (__add) {
										__add("Go Home");
									});
								});
							}
						});
					});
				});
			});
		}
	}, {
		key: "clear",
		value: function clear(block, attributes, a) {
			return jade2react.render(this, function (__add) {
				if (clearindex++ % 3 == 0) {
					__add(React.createFactory('div'), { "className": 'clearfix' + " " + 'visible-lg' + " " + 'visible-md' + " " + 'visible-sm' });
				}
				__add(React.createFactory('div'), { "className": 'clearfix' + " " + 'visible-xs' }, function (__add) {
					__add("       ");
				});
			});
		}
	}, {
		key: "componentWillMount",
		value: function componentWillMount() {
			this.client = new DeviceClient();
			this.client.on("change", function () {
				this.update();
			}.bind(this));
			this.client.listen();
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			if (this.client) this.client.disconnect();
		}
	}, {
		key: "getNeededPermissions",
		value: function getNeededPermissions() {
			return [];
		}
	}, {
		key: "mainlightOn",
		value: function mainlightOn() {
			this.client.devices.mainlight.turnOn();
		}
	}, {
		key: "mainlightHalfOn",
		value: function mainlightHalfOn() {
			this.client.devices.mainlight.turnHalfOn();
		}
	}, {
		key: "mainlightOff",
		value: function mainlightOff() {
			this.client.devices.mainlight.turnOff();
		}
	}, {
		key: "shuttersUp",
		value: function shuttersUp() {
			this.client.devices.shutters.moveUp();
		}
	}, {
		key: "shuttersDown",
		value: function shuttersDown() {
			this.client.devices.shutters.moveDown();
		}
	}, {
		key: "shuttersStop",
		value: function shuttersStop() {
			this.client.devices.shutters.stop();
		}
	}, {
		key: "shuttersTilt",
		value: function shuttersTilt() {
			this.client.devices.shutters.tilt();
		}
	}, {
		key: "gateOpen",
		value: function gateOpen() {
			this.client.devices.gate.open();
		}
	}, {
		key: "gateClose",
		value: function gateClose() {
			this.client.devices.gate.close();
		}
	}, {
		key: "gateStop",
		value: function gateStop() {
			this.client.devices.gate.stop();
		}
	}, {
		key: "createScene",
		value: function createScene() {
			this.state.createscene = { name: "" };
			this.update();
		}
	}, {
		key: "validateCreateSceneName",
		value: function validateCreateSceneName(e) {
			this.state.createscene.name = e.target.value;
			this.update();
		}
	}, {
		key: "cancelCreateScene",
		value: function cancelCreateScene() {
			delete this.state.createscene;
			this.update();
		}
	}, {
		key: "confirmCreateScene",
		value: function confirmCreateScene() {
			var name = this.state.createscene.name;
			delete this.state.createscene;
			this.update();
			this.client.devices.officelight.createScene(name);
		}
	}, {
		key: "setScene",
		value: function setScene(id) {
			return function () {
				this.client.devices.officelight.setScene(id);
			}.bind(this);
		}
	}, {
		key: "deleteScene",
		value: function deleteScene(id) {
			return function () {
				this.client.devices.officelight.deleteScene(id);
			}.bind(this);
		}
	}, {
		key: "workshopOn",
		value: function workshopOn() {
			this.client.devices.workshoplight.turnOn();
		}
	}, {
		key: "workshopOff",
		value: function workshopOff() {
			this.client.devices.workshoplight.turnOff();
		}
	}, {
		key: "sonosPlay",
		value: function sonosPlay() {
			this.client.devices.sonos.play();
		}
	}, {
		key: "sonosPause",
		value: function sonosPause() {
			this.client.devices.sonos.pause();
		}
	}, {
		key: "startTicTacToe",
		value: function startTicTacToe() {
			visit("/tictactoe");
		}
	}, {
		key: "outdoorlightOn",
		value: function outdoorlightOn() {
			this.client.devices.outdoorlight.turnOn();
		}
	}, {
		key: "outdoorlightOff",
		value: function outdoorlightOff() {
			this.client.devices.outdoorlight.turnOff();
		}
	}, {
		key: "outerdoorUnlock",
		value: function outerdoorUnlock() {
			this.client.devices.outerdoor.setAutoLock(false);
		}
	}, {
		key: "outerdoorLock",
		value: function outerdoorLock() {
			this.client.devices.outerdoor.setAutoLock(true);
		}
	}, {
		key: "innerdoorUnlock",
		value: function innerdoorUnlock() {
			this.client.devices.innerdoor.setAutoLock(false);
		}
	}, {
		key: "innerdoorLock",
		value: function innerdoorLock() {
			this.client.devices.innerdoor.setAutoLock(true);
		}
	}, {
		key: "goHome",
		value: function goHome() {
			this.mainlightOff();
			this.workshopOff();
			this.outdoorLightOff();
			this.outerdoorLock();
			this.innerdoorLock();
			this.sonosPause();
			this.client.devices.officelight.setSceneByName("Aus");
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");
var Modal = require("require")("boxify/lib/views/Modal.js");
var clearindex = 0;

},{"../client/index":"/control-center/lib/plugin/client/client/index.js","boxify/lib/views/base":"/control-center/lib/node_modules/boxify/lib/views/base.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/pin.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			__add(React.createFactory(Modal), {}, function (__add) {
				__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
					__add(React.createFactory('h3'), {}, function (__add) {
						__add([this.state.pin._id.firstname || "", this.state.pin._id.lastname || ""].join(" "));
					});
				});
				__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
					__add(React.createFactory('div'), { "className": 'form-horizontal' }, function (__add) {
						__add(React.createFactory('div'), { "className": "form-group " + (this.state.newPin !== undefined && this.state.newPin.length < 4 ? "has-error" : undefined) }, function (__add) {
							__add(React.createFactory('label'), { "className": 'control-label' + " " + 'col-xs-2' }, function (__add) {
								__add("PIN");
							});
							__add(React.createFactory('div'), { "className": 'col-xs-10' }, function (__add) {
								__add("                   ");
								__add(React.createFactory('input'), { "type": "text", "ref": "pin", "value": this.state.newPin || this.state.pin.pin || "", "disabled": this.state.newPin === undefined, "onClick": this.editPin.bind(this), "onChange": this.onPinChanged.bind(this), "bsStyle": this.state.newPin !== undefined && this.state.newPin.length < 4 ? "error" : undefined, "className": 'form-control' });
							});
						});
						__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
							__add(React.createFactory('label'), { "className": 'col-xs-2' + " " + 'control-label' }, function (__add) {
								__add("Zugang");
							});
							__add(React.createFactory('div'), { "className": 'col-xs-10' + " " + 'checkbox' }, function (__add) {
								__add(React.createFactory('label'), {}, function (__add) {
									__add(React.createFactory('input'), { "type": "radio", "checked": !this.state.pin.full, "onClick": this.onAccessClicked.bind(this), "ref": "half" });
									__add(" Abhollager");
								});
								__add(React.createFactory('label'), {}, function (__add) {
									__add(React.createFactory('input'), { "type": "radio", "checked": this.state.pin.full, "onClick": this.onAccessClicked.bind(this), "ref": "full" });
									__add(" Vollzugang");
								});
							});
						});
					});
					__add(React.createFactory('h3'), {}, function (__add) {
						__add("Regeln");
					});
					__add(React.createFactory('table'), { "className": 'table' + " " + 'table-striped' }, function (__add) {
						__add(React.createFactory('tbody'), {}, function (__add) {
							for (var __key in this.state.pin.rules) {
								var rule = this.state.pin.rules[__key];
								__add(React.createFactory('tr'), {}, function (__add) {
									__add(React.createFactory('td'), { "className": 'form-horizontal' }, function (__add) {
										__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
											__add(React.createFactory('label'), { "className": 'input-label' + " " + 'col-lg-2' }, function (__add) {
												__add("Datum");
											});
											__add(React.createFactory('div'), { "style": jade2react.mapStyle("display:flex"), "className": 'col-lg-10' }, function (__add) {
												__add(React.createFactory(DatePicker), { "style": jade2react.mapStyle("flex:1"), "time": false, "value": rule.from ? new Date(rule.from) : undefined, "onChange": this.onFromChanged(rule) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("display:inline-block;lineHeight:32px;paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("bis");
												});
												__add(React.createFactory(DatePicker), { "style": jade2react.mapStyle("flex:1"), "time": false, "value": rule.to ? new Date(rule.to) : undefined, "onChange": this.onToChanged(rule) });
											});
										});
										__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
											__add(React.createFactory('label'), { "className": 'input-label' + " " + 'col-lg-2' }, function (__add) {
												__add("Zeit");
											});
											__add(React.createFactory('div'), { "style": jade2react.mapStyle("display:flex"), "className": 'col-lg-10' }, function (__add) {
												__add(React.createFactory(DatePicker), { "style": jade2react.mapStyle("flex:1"), "calendar": false, "value": rule.timeFrom ? new Date(rule.timeFrom) : undefined, "onChange": this.onTimeFromChanged(rule) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("display:inline-block;lineHeight:32px;paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("bis");
												});
												__add(React.createFactory(DatePicker), { "style": jade2react.mapStyle("flex:1"), "calendar": false, "value": rule.timeTo ? new Date(rule.timeTo) : undefined, "onChange": this.onTimeToChanged(rule) });
											});
										});
										__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
											__add(React.createFactory('label'), { "className": 'input-label' + " " + 'col-lg-2' }, function (__add) {
												__add("Wochentage");
											});
											__add(React.createFactory('div'), { "style": jade2react.mapStyle("display:flex"), "className": 'col-lg-10' }, function (__add) {
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("M");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 0), "onChange": this.toggleDay(rule, 0) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("D");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 1), "onChange": this.toggleDay(rule, 1) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("M");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 2), "onChange": this.toggleDay(rule, 2) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("D");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 3), "onChange": this.toggleDay(rule, 3) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("F");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 4), "onChange": this.toggleDay(rule, 4) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("S");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 5), "onChange": this.toggleDay(rule, 5) });
												__add(React.createFactory('span'), { "style": jade2react.mapStyle("paddingLeft:10px;paddingRight:10px") }, function (__add) {
													__add("S");
												});
												__add(React.createFactory('input'), { "type": "checkbox", "checked": this.dayEnabled(rule, 6), "onChange": this.toggleDay(rule, 6) });
											});
										});
									});
									__add(React.createFactory('td'), {}, function (__add) {
										__add(React.createFactory('div'), { "style": jade2react.mapStyle("marginTop:60px"), "onClick": this.deleteRule(rule), "className": 'btn' + " " + 'btn-default' }, function (__add) {
											__add(React.createFactory('i'), { "className": 'glyphicon' + " " + 'glyphicon-trash' });
										});
									});
								});
							}
							__add(React.createFactory('tr'), {}, function (__add) {
								__add(React.createFactory('td'), { "colSpan": 2, "style": jade2react.mapStyle("textAlign:center") }, function (__add) {
									__add(React.createFactory('div'), { "onClick": this.addRule.bind(this), "className": 'btn' + " " + 'btn-default' + " " + 'pull-right' }, function (__add) {
										__add(React.createFactory('i'), { "className": 'glyphicon' + " " + 'glyphicon-plus' });
										__add(" Regel hinzufügen");
									});
								});
							});
						});
					});
				});
				__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
					__add(React.createFactory('div'), { "onClick": this.props.onClose, "className": 'btn' + " " + 'btn-default' }, function (__add) {
						__add("Abbrechen");
					});
					__add(React.createFactory('div'), { "onClick": this.save.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
						__add("Speichern");
					});
				});
			});
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.state = { pin: _this.props.pin };
		return _this;
	}

	_createClass(Component, [{
		key: "editPin",
		value: function editPin() {
			if (this.state.newPin === undefined) this.state.newPin = this.state.pin.pin;
			this.forceUpdate();
			setTimeout(function () {
				this.refs.pin.getDOMNode().getElementsByTagName("INPUT")[0].select();
			}.bind(this));
		}
	}, {
		key: "onPinChanged",
		value: function onPinChanged(e) {
			this.state.newPin = e.target.value;
			this.forceUpdate();
		}
	}, {
		key: "save",
		value: function save() {
			if (this.state.newPin && this.state.newPin.length < 4) return;
			var data = {
				rules: this.state.pin.rules,
				full: this.state.pin.full
			};
			if (this.state.newPin) data.pin = this.state.newPin;
			client.updatePin(this.state.pin._id._id, data, function (err) {
				this.state.pin.pin = this.state.newPin;
				this.props.onClose();
			}.bind(this));
		}
	}, {
		key: "onFromChanged",
		value: function onFromChanged(rule) {
			return function (date) {
				if (date) {
					rule.from = date.getTime();
				} else {
					delete rule.from;
				}
				this.forceUpdate();
			}.bind(this);
		}
	}, {
		key: "onToChanged",
		value: function onToChanged(rule) {
			return function (date) {
				if (date) {
					rule.to = date.getTime();
				} else {
					delete rule.to;
				}
			}.bind(this);
		}
	}, {
		key: "onTimeFromChanged",
		value: function onTimeFromChanged(rule) {
			return function (time) {
				if (time) {
					rule.timeFrom = new Date(1970, 0, 1, time.getHours(), time.getMinutes()).getTime();
				} else {
					delete rule.timeFrom;
				}
				this.forceUpdate();
			}.bind(this);
		}
	}, {
		key: "onTimeToChanged",
		value: function onTimeToChanged(rule) {
			return function (time) {
				if (time) {
					rule.timeTo = new Date(1970, 0, 1, time.getHours(), time.getMinutes()).getTime() + 59999;
				} else {
					delete rule.timeTo;
				}
				this.forceUpdate();
			}.bind(this);
		}
	}, {
		key: "dayEnabled",
		value: function dayEnabled(rule, day) {
			return !rule.days || !rule.days.length || rule.days.indexOf(day) >= 0;
		}
	}, {
		key: "toggleDay",
		value: function toggleDay(rule, day) {
			return function () {
				if (this.dayEnabled(rule, day)) {
					if (!rule.days || !rule.days.length) rule.days = [0, 1, 2, 3, 4, 5, 6];
					rule.days.splice(rule.days.indexOf(day), 1);
					if (!rule.days.length) delete rule.days;
				} else {
					if (!rule.days) rule.days = [];
					rule.days.push(day);
					rule.days.sort();
				}
				this.forceUpdate();
			}.bind(this);
		}
	}, {
		key: "deleteRule",
		value: function deleteRule(rule) {
			return function () {
				this.state.pin.rules.splice(this.state.pin.rules.indexOf(rule), 1);
				this.forceUpdate();
			}.bind(this);
		}
	}, {
		key: "addRule",
		value: function addRule(rule) {
			this.state.pin.rules.push({});
			this.forceUpdate();
		}
	}, {
		key: "onAccessClicked",
		value: function onAccessClicked(e) {
			this.state.pin.full = e.target == this.refs.full;
			this.forceUpdate();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var Modal = require("require")("boxify/lib/views/Modal.js");
var client = require("../client");
var DatePicker = require("react-widgets").DateTimePicker;
var day = 1000 * 60 * 60 * 24;

},{"../client":"/control-center/lib/plugin/client/client.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","react-widgets":"/control-center/lib/node_modules/react-widgets.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/pins.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = require("boxify/lib/views/base");

var Component = function (_Base) {
	_inherits(Component, _Base);

	function Component() {
		_classCallCheck(this, Component);

		return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).apply(this, arguments));
	}

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "_render", this).call(this, __add);
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "body",
		value: function body(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "body", this).call(this, __add);
			__add(React.createFactory('div'), { "className": 'container' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Zugänge");
				});
				__add(React.createFactory('button'), { "onClick": this.create.bind(this), "className": 'btn' + " " + 'btn-primary' + " " + 'pull-right' }, function (__add) {
					__add("Erstellen");
				});
				__add(React.createFactory('table'), { "className": 'table' + " " + 'table-striped' }, function (__add) {
					__add(React.createFactory('thead'), {}, function (__add) {
						__add(React.createFactory('tr'), {}, function (__add) {
							__add(React.createFactory('th'), {}, function (__add) {
								__add("Kontakt");
							});
							__add(React.createFactory('th'), {}, function (__add) {
								__add("Gültigkeit");
							});
						});
					});
					__add(React.createFactory('tbody'), {}, function (__add) {
						for (var __key in this.state.pins) {
							var pin = this.state.pins[__key];
							__add(React.createFactory('tr'), { "onClick": this.editPin(pin) }, function (__add) {
								__add(React.createFactory('td'), {}, function (__add) {
									__add([pin._id.firstname || "", pin._id.lastname || ""].join(" "));
								});
								__add(React.createFactory('td'), {}, function (__add) {
									__add(React.createFactory('button'), { "onClick": this.delete(pin), "className": 'btn' + " " + 'btn-xs' + " " + 'btn-default' + " " + 'pull-right' }, function (__add) {
										__add(React.createFactory('i'), { "className": 'glyphicon' + " " + 'glyphicon-trash' });
									});
									if (!pin.rules.length) {
										__add(React.createFactory('div'), {}, function (__add) {
											__add("Immer");
										});
									}
									for (var __key in pin.rules) {
										var rule = pin.rules[__key];
										__add(React.createFactory('div'), {}, function (__add) {
											__add(this.renderRule(rule));
										});
									}
								});
							});
						}
					});
				});
			});
			if (this.state.pin) {
				__add(React.createFactory(Modal), {}, function (__add) {
					__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
						__add(React.createFactory('h2'), {}, function (__add) {
							__add("Zugang erstellen");
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
						__add(React.createFactory('div'), { "className": 'form-horizontal' }, function (__add) {
							__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
								__add(React.createFactory('label'), { "className": 'col-xs-2' + " " + 'control-label' }, function (__add) {
									__add("Kontakt");
								});
								__add(React.createFactory('div'), { "className": 'col-xs-10' }, function (__add) {
									__add(React.createFactory(ContactBox), { "value": this.state.pin._id && this.state.pin._id._id, "onChange": this.onPersonChanged.bind(this), "type": "person" });
								});
							});
							__add(React.createFactory('div'), { "className": "form-group " + (this.state.pin.pin.length < 4 ? "has-error" : undefined) }, function (__add) {
								__add(React.createFactory('label'), { "className": 'col-xs-2' + " " + 'control-label' }, function (__add) {
									__add("PIN");
								});
								__add(React.createFactory('div'), { "className": 'col-xs-10' }, function (__add) {
									__add(React.createFactory('input'), { "type": "text", "value": this.state.pin.pin, "onChange": this.onPinChanged.bind(this), "className": 'form-control' });
								});
							});
							__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
								__add(React.createFactory('label'), { "className": 'col-xs-2' + " " + 'control-label' }, function (__add) {
									__add("Zugang");
								});
								__add(React.createFactory('div'), { "className": 'col-xs-10' + " " + 'checkbox' }, function (__add) {
									__add(React.createFactory('label'), {}, function (__add) {
										__add(React.createFactory('input'), { "type": "radio", "checked": !this.state.pin.full, "onClick": this.onAccessClicked.bind(this), "ref": "half" });
										__add(" Abhollager");
									});
									__add(React.createFactory('label'), {}, function (__add) {
										__add(React.createFactory('input'), { "type": "radio", "checked": this.state.pin.full, "onClick": this.onAccessClicked.bind(this), "ref": "full" });
										__add(" Vollzugang");
									});
								});
							});
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
						__add(React.createFactory('button'), { "onClick": this.cancel.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
							__add("Abbrechen");
						});
						__add(React.createFactory('button'), { "onClick": this.confirm.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
							__add("Erstellen");
						});
					});
				});
			}
			if (this.state.editPin) {
				__add(React.createFactory(Pin), { "pin": this.state.editPin, "onClose": this.closePin.bind(this) });
			}
			if (this.state.delete) {
				__add(React.createFactory(Modal), {}, function (__add) {
					__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
						__add(React.createFactory('h2'), {}, function (__add) {
							__add("Zugang löschen");
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
						__add("Möchten Sie den Zugang für");
						__add(React.createFactory('b'), {}, function (__add) {
							__add(" " + [this.state.delete._id.firstname || "", this.state.delete._id.lastname || ""].join(" "));
						});
						__add(" wirklich löschen?");
					});
					__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
						__add(React.createFactory('button'), { "onClick": this.cancel.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
							__add("Abbrechen");
						});
						__add(React.createFactory('button'), { "onClick": this.confirm.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
							__add("Löschen");
						});
					});
				});
			}
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			if (!this.state.pins) this.loadData();
		}
	}, {
		key: "loadData",
		value: function loadData() {
			client.getPins(function (err, pins) {
				this.state.pins = pins;
				this.update();
			}.bind(this));
		}
	}, {
		key: "create",
		value: function create() {
			this.state.pin = { _id: null, pin: "", full: false };
			this.update();
		}
	}, {
		key: "onPersonChanged",
		value: function onPersonChanged(person) {
			this.state.pin._id = { _id: person };
			this.update();
		}
	}, {
		key: "onPinChanged",
		value: function onPinChanged(e) {
			this.state.pin.pin = e.target.value;
			this.update();
		}
	}, {
		key: "cancel",
		value: function cancel() {
			delete this.state.pin;
			delete this.state.delete;
			this.update();
		}
	}, {
		key: "delete",
		value: function _delete(pin) {
			return function () {
				this.state.delete = pin;
				this.update();
			}.bind(this);
		}
	}, {
		key: "confirm",
		value: function confirm() {
			if (this.state.pin) {
				client.createPin({ contact: this.state.pin._id._id, pin: this.state.pin.pin, full: this.state.pin.full }, function () {
					delete this.state.pin;
					this.loadData();
				}.bind(this));
			} else if (this.state.delete) {
				client.deletePin(this.state.delete._id._id, function () {
					delete this.state.delete;
					this.loadData();
				}.bind(this));
			}
		}
	}, {
		key: "renderRule",
		value: function renderRule(rule) {
			var entries = [];

			if (rule.from && rule.to) {
				entries.push(moment(rule.from).format("LL") + " - " + moment(rule.to).format("LL"));
			} else if (rule.from) {
				entries.push("ab " + moment(rule.from).format("LL"));
			} else if (rule.to) {
				entries.push("bis " + moment(rule.to).format("LL"));
			}

			if (rule.timeFrom !== undefined || rule.timeTo !== undefined) {
				entries.push(moment(rule.timeFrom !== undefined ? rule.timeFrom : defaultTimeFrom).format("LT") + " - " + moment(rule.timeTo !== undefined ? rule.timeTo : defaultTimeTo).format("LT"));
			}
			if (rule.days && rule.days.length < 7) {
				for (var i = 0; rule.days && i < rule.days.length; i++) {
					for (var j = 1; j < rule.days.length - i && rule.days[i + j] == rule.days[i] + j; j++) {}
					j--;
					if (j >= 1) {
						entries.push(days[rule.days[i]] + "-" + days[rule.days[i] + j]);
						i += j;
					} else {
						entries.push(days[rule.days[i]]);
					}
				}
			}

			if (!entries.length) entries.push("Immer");
			return entries.join(", ");
		}
	}, {
		key: "editPin",
		value: function editPin(pin) {
			return function (e) {
				if (e.target.tagName == "I" || e.target.tagName == "BUTTON") return;
				this.state.editPin = JSON.parse(JSON.stringify(pin));
				this.update();
			}.bind(this);
		}
	}, {
		key: "closePin",
		value: function closePin() {
			delete this.state.editPin;
			this.loadData();
		}
	}, {
		key: "onAccessClicked",
		value: function onAccessClicked(e) {
			this.state.pin.full = e.target == this.refs.full;
			this.forceUpdate();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var client = require("../client");
var Modal = require("require")("boxify/lib/views/Modal.js");
var ContactBox = require("require")("boxify/lib/views/ContactBox.js");
var moment = require("moment");
var Pin = require("./pin");
var days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
var defaultTimeFrom = new Date(1970, 0, 1, 0, 0, 0).getTime();
var defaultTimeTo = new Date(1970, 0, 1, 23, 59, 59, 999).getTime();

},{"../client":"/control-center/lib/plugin/client/client.js","./pin":"/control-center/lib/plugin/client/views/pin.js","boxify/lib/views/base":"/control-center/lib/node_modules/boxify/lib/views/base.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","moment":"/control-center/node_modules/moment/moment.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/tablet-bistro.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = require("./tablet-indoor");

var Component = function (_Base) {
	_inherits(Component, _Base);

	function Component() {
		_classCallCheck(this, Component);

		return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).apply(this, arguments));
	}

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "_render", this).call(this, __add);
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "content",
		value: function content(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "content", this).call(this, __add);
			__add(React.createFactory('style'), { "dangerouslySetInnerHTML": { __html: "h1{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "    font-size:30px;" + "\n" + "    line-height:60px;" + "\n" + "    margin-top:30px;" + "\n" + "}" } });
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Bistro Licht");
				});
				__add(React.createFactory('div'), { "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Scene 1");
				});
				__add(React.createFactory('div'), { "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Scene 2");
				});
				__add(React.createFactory('div'), { "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Scene 3");
				});
				__add(React.createFactory('div'), { "onClick": this.turnOfficeOn.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Büro Scene hell  ");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Lager Licht         ");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("An");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightHalfOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Halb");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightOff.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Aus");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Werkstatt Licht");
				});
				__add(React.createFactory('div'), { "onClick": this.workshopOn.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("An");
				});
				__add(React.createFactory('div'), { "onClick": this.workshopOff.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Aus");
				});
				__add(React.createFactory('div'), { "onClick": this.sonosPlay.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Sonos play");
				});
			});
		}
	}, {
		key: "getNeededPermissions",
		value: function getNeededPermissions() {
			return ["officelight", "mainlight", "workshoplight", "sonos"];
		}
	}, {
		key: "mainlightOn",
		value: function mainlightOn() {
			this.client.devices.mainlight.turnOn();
		}
	}, {
		key: "mainlightHalfOn",
		value: function mainlightHalfOn() {
			this.client.devices.mainlight.turnHalfOn();
		}
	}, {
		key: "mainlightOff",
		value: function mainlightOff() {
			this.client.devices.mainlight.turnOff();
		}
	}, {
		key: "workshopOn",
		value: function workshopOn() {
			this.client.devices.workshoplight.turnOn();
		}
	}, {
		key: "workshopOff",
		value: function workshopOff() {
			this.client.devices.workshoplight.turnOff();
		}
	}, {
		key: "turnOfficeOn",
		value: function turnOfficeOn() {
			this.client.devices.officelight.setSceneByName("An");
		}
	}, {
		key: "sonosPlay",
		value: function sonosPlay() {
			this.client.devices.sonos.play();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

},{"./tablet-indoor":"/control-center/lib/plugin/client/views/tablet-indoor.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js"}],"/control-center/lib/plugin/client/views/tablet-indoor.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			__add(React.createFactory('div'), {}, function (__add) {
				if (this.needsLogin()) {
					__add(React.createFactory('h1'), {}, function (__add) {
						__add("Login Benötigt");
					});
					__add(React.createFactory('div'), { "className": 'form-horizontal' }, function (__add) {
						__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
							__add(React.createFactory('label'), { "className": 'col-lg-2' + " " + 'control-label' }, function (__add) {
								__add("E-Mail");
							});
							__add(React.createFactory('div'), { "className": 'col-lg-10' }, function (__add) {
								__add(React.createFactory('input'), { "type": "text", "value": this.state.email || "", "onChange": this.onMailChanged.bind(this), "className": 'form-control' });
							});
						});
						__add(React.createFactory('div'), { "className": 'form-group' }, function (__add) {
							__add(React.createFactory('label'), { "className": 'col-lg-2' + " " + 'control-label' }, function (__add) {
								__add("Passwort");
							});
							__add(React.createFactory('div'), { "className": 'col-lg-10' }, function (__add) {
								__add(React.createFactory('input'), { "type": "password", "value": this.state.password || "", "onChange": this.onPasswordChanged.bind(this), "className": 'form-control' });
							});
						});
					});
					__add(React.createFactory('div'), { "onClick": this.login.bind(this), "className": 'btn' + " " + 'btn-primary' + " " + 'pull-right' }, function (__add) {
						__add("Anmelden");
					});
				} else {
					if (this.listen && this.client.state != "connected") {
						__add(React.createFactory('div'), { "className": 'alert' + " " + 'alert-warning' }, function (__add) {
							__add(this.client.state == "connecting" ? "Verbinung wird hergestellt..." : "Verbindung verloren. Erneut verbinden in " + this.client.timeUntilReconnect + "s...");
						});
					}
					this.content(__add);
				}
			});
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "content",
		value: function content(__add) {}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.state = {};
		return _this;
	}

	_createClass(Component, [{
		key: "needsLogin",
		value: function needsLogin() {
			var needed = this.getNeededPermissions();
			for (var i = 0; i < needed.length; i++) {
				if (!client.hasPermission(needed[i])) return true;
			}
			return false;
		}
	}, {
		key: "getNeededPermissions",
		value: function getNeededPermissions() {
			return [];
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			this.client.disconnect();
		}
	}, {
		key: "onMailChanged",
		value: function onMailChanged(e) {
			this.state.email = e.target.value;
			this.forceUpdate();
		}
	}, {
		key: "onPasswordChanged",
		value: function onPasswordChanged(e) {
			this.state.password = e.target.value;
			this.forceUpdate();
		}
	}, {
		key: "login",
		value: function login() {
			var self = this;
			if (!this.state.email || !this.state.password) return;
			client.createSession({ email: this.state.email, password: this.state.password }, function (err, sessionid) {
				if (err) return alert("Login fehlgeschlagen!");
				self.forceUpdate();
			});
		}
	}, {
		key: "componentWillMount",
		value: function componentWillMount() {
			this.client = new DeviceClient();
			this.client.on("change", function () {
				this.forceUpdate();
			}.bind(this));
			if (this.listen) this.client.listen();
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			this.client.disconnect();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");

},{"../client/index":"/control-center/lib/plugin/client/client/index.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/tablet-office.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = require("./tablet-indoor");

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "_render", this).call(this, __add);
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "content",
		value: function content(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "content", this).call(this, __add);
			__add(React.createFactory('style'), { "dangerouslySetInnerHTML": { __html: "h1{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "    font-size:30px;" + "\n" + "    line-height:60px;" + "\n" + "    margin-top:30px;" + "\n" + "}" } });
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Licht");
				});
				__add(React.createFactory('div'), { "onClick": this.setScene("Aus"), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Aus");
				});
				__add(React.createFactory('div'), { "onClick": this.setScene("An"), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("An");
				});
				__add(React.createFactory('div'), { "onClick": this.setScene("Chregi Work"), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Chregi");
				});
				__add(React.createFactory('div'), { "onClick": this.setScene("Fäbu Work"), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Fäbu");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Storen");
				});
				__add(React.createFactory('div'), { "onClick": this.shuttersUp.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Hoch");
				});
				__add(React.createFactory('div'), { "onClick": this.shuttersDown.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Runter");
				});
				__add(React.createFactory('div'), { "onClick": this.shuttersStop.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Stop");
				});
				__add(React.createFactory('div'), { "onClick": this.shuttersTilt.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Gekippt");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Lager");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightHalfOn.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Lager Licht halb");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightOff.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Lager Licht aus");
				});
				__add(React.createFactory('div'), { "onClick": this.sonosPlay.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Sonos play");
				});
				__add(React.createFactory('div'), { "onClick": this.goHome.bind(this), "className": 'btn' + " " + 'btn-danger' }, function (__add) {
					__add("Go Home");
				});
			});
			if (this.state.showGateWarning) {
				__add(React.createFactory(Modal), {}, function (__add) {
					__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
						__add(React.createFactory('h2'), {}, function (__add) {
							__add("Achtung!");
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-body' }, function (__add) {
						__add("Das Tor ist noch geöffnet. Bitte schliessen Sie es bevor sie gehen!");
					});
					__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
						__add(React.createFactory('button'), { "onClick": this.closeGateWarning.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
							__add("Mach ich, danke!");
						});
					});
				});
			}
			if (this.state.goHomeCountdown) {
				__add(React.createFactory(Modal), {}, function (__add) {
					__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
						__add(React.createFactory('h2'), {}, function (__add) {
							__add("Selbstzerstörung in " + this.state.goHomeCountdown + "s...");
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
						__add(React.createFactory('button'), { "onClick": this.abortGoHome.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
							__add("Abbrechen");
						});
					});
				});
			}
		}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.listen = true;
		return _this;
	}

	_createClass(Component, [{
		key: "getNeededPermissions",
		value: function getNeededPermissions() {
			return ["officelight", "mainlight", "workshoplight", "outdoorlight", "shutters", "outerdoor", "innerdoor", "gate", "sonos"];
		}
	}, {
		key: "shuttersUp",
		value: function shuttersUp() {
			this.client.devices.shutters.moveUp();
		}
	}, {
		key: "shuttersDown",
		value: function shuttersDown() {
			this.client.devices.shutters.moveDown();
		}
	}, {
		key: "shuttersStop",
		value: function shuttersStop() {
			this.client.devices.shutters.stop();
		}
	}, {
		key: "shuttersTilt",
		value: function shuttersTilt() {
			this.client.devices.shutters.tilt();
		}
	}, {
		key: "setScene",
		value: function setScene(name) {
			return function () {
				this.client.devices.officelight.setSceneByName(name);
			}.bind(this);
		}
	}, {
		key: "mainlightHalfOn",
		value: function mainlightHalfOn() {
			this.client.devices.mainlight.turnHalfOn();
		}
	}, {
		key: "mainlightOff",
		value: function mainlightOff() {
			this.client.devices.mainlight.turnOff();
		}
	}, {
		key: "goHome",
		value: function goHome() {
			if (this.client.devices.gate.state.state != "closed" || this.client.devices.outerdoor.state.open) {
				this.state.showGateWarning = true;
			} else {
				this.state.goHomeCountdown = 30;
				this.goHomeInterval = setInterval(function () {
					if (--this.state.goHomeCountdown <= 0) {
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
				}.bind(this), 1000);
			}
			this.forceUpdate();
		}
	}, {
		key: "closeGateWarning",
		value: function closeGateWarning() {
			delete this.state.showGateWarning;
			this.forceUpdate();
		}
	}, {
		key: "abortGoHome",
		value: function abortGoHome() {
			clearInterval(this.goHomeInterval);
			delete this.state.goHomeCountdown;
			this.forceUpdate();
		}
	}, {
		key: "sonosPlay",
		value: function sonosPlay() {
			this.client.devices.sonos.play();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var DeviceClient = require("../client/index");
var Modal = require("require")("boxify/lib/views/Modal.js");

},{"../client/index":"/control-center/lib/plugin/client/client/index.js","./tablet-indoor":"/control-center/lib/plugin/client/views/tablet-indoor.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/tablet-outdoor.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = React.Component;

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			__add(React.createFactory('div'), {}, function (__add) {
				__add(React.createFactory('style'), { "dangerouslySetInnerHTML": { __html: "html,body{" + "\n" + "    height:100vh;" + "\n" + "    width:100vw;" + "\n" + "    margin:0px;" + "\n" + "    padding:0px;" + "\n" + "}" + "\n" + ".col-xs-9, .btn{" + "\n" + "    margin-top:20px;" + "\n" + "}" + "\n" + ".btn, html body input.form-control{" + "\n" + "    font-size:76px;" + "\n" + "    display:block;" + "\n" + "    height:10%;" + "\n" + "}" + "\n" + ".col-xs-3 .btn, .col-xs-4 .btn{" + "\n" + "    font-size:50px;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "}" + "\n" + ".modal .btn{" + "\n" + "    width:auto;" + "\n" + "    font-size:30px;" + "\n" + "}" + "\n" + "html body input.form-control{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + "" } });
				if (!client.session) {
					__add(React.createFactory('div'), { "className": 'col-xs-9' }, function (__add) {
						__add(React.createFactory('input'), { "type": "text", "ref": "code", "value": new Array((this.state.code || "").length + 1).join("*"), "onFocus": function onFocus(e) {
								e.target.blur();
							}, "className": 'form-control' + " " + 'block-field' });
						__add(React.createFactory('div'), { "className": 'row' }, function (__add) {
							__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(7), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("7");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(4), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("4");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(1), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("1");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clear.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("DEL");
								});
							});
							__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(8), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("8");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(5), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("5");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(2), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("2");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(0), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("0");
								});
							});
							__add(React.createFactory('div'), { "className": 'col-xs-4' }, function (__add) {
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(9), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("9");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(6), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("6");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.clickNum(3), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("3");
								});
								__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;background:white;border:1px solid #ccc"), "onTouchStart": this.login.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
									__add("OK");
								});
							});
						});
					});
					__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
						__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;border:1px solid #ccc;marginTop:162px"), "onTouchStart": this.bellLight.bind(this), "className": 'btn' + " " + 'btn-danger' }, function (__add) {
							__add("Licht");
						});
						__add(React.createFactory('div'), { "style": jade2react.mapStyle("width:100%;height:295px;border:1px solid #ccc"), "onTouchStart": this.bellRing.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
							__add(React.createFactory('i'), { "style": jade2react.mapStyle("lineHeight:260px"), "className": 'glyphicon' + " " + 'glyphicon-bell' });
						});
					});
				} else {
					if (client.hasPermission("gate")) {
						__add(React.createFactory('div'), { "className": 'col-xs-12' }, function (__add) {
							__add(React.createFactory('h1'), {}, function (__add) {
								__add("Willkommen, " + client.session.user.firstname + " " + client.session.user.lastname);
							});
						});
						__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
							if (client.hasPermission("gate")) {
								__add(React.createFactory('h1'), {}, function (__add) {
									__add("Tor");
								});
								__add(React.createFactory('div'), { "onTouchStart": this.openGate.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
									__add("Öffnen");
								});
								__add(React.createFactory('div'), { "onTouchStart": this.stopGate.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
									__add("Stoppen");
								});
								__add(React.createFactory('div'), { "onTouchStart": this.closeGate.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
									__add("Schliessen");
								});
							}
						});
						__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
							if (client.hasPermission("outdoorlight")) {
								__add(React.createFactory('h1'), {}, function (__add) {
									__add("Aussenlicht");
								});
								__add(React.createFactory('div'), { "onTouchStart": this.outdoorlightOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
									__add("An");
								});
								__add(React.createFactory('div'), { "onTouchStart": this.outdoorlightOff.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
									__add("Aus");
								});
							}
						});
						__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
							__add(React.createFactory('h1'), {}, function (__add) {
								__add("Türen");
							});
							__add(React.createFactory('div'), { "onClick": this.lockDoors.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
								__add("Verriegeln");
							});
							__add(React.createFactory('div'), { "onClick": this.unlockDoors.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
								__add("Entriegeln");
							});
						});
						__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
							if (client.hasPermission("alloff")) {
								__add(React.createFactory('h1'), {}, function (__add) {
									__add("Feierabend");
								});
								__add(React.createFactory('div'), { "onClick": this.allOff.bind(this), "className": 'btn' + " " + 'btn-danger' }, function (__add) {
									__add("Go Home");
								});
							}
						});
					} else {
						__add(React.createFactory('div'), { "style": jade2react.mapStyle("height:100%;line-height:800px;text-align:center;font-size:100px") }, function (__add) {
							__add("Bitte eintreten");
						});
					}
				}
				if (this.state.showPinError) {
					__add(React.createFactory(Modal), {}, function (__add) {
						__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
							__add(React.createFactory('h2'), {}, function (__add) {
								__add("Die eingegebene PIN ist ungültig!");
							});
						});
						__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
							__add(React.createFactory('button'), { "onClick": this.closePinError.bind(this), "className": 'btn' + " " + 'btn-primary' + " " + 'pull-right' }, function (__add) {
								__add("Nochmals probieren");
							});
						});
					});
				}
			});
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.state = {};
		return _this;
	}

	_createClass(Component, [{
		key: "componentWillMount",
		value: function componentWillMount() {
			var self = this;
			if (client.session) {
				client.deleteSession(function () {
					self.forceUpdate();
				});
			}
			this.client = new DeviceClient();
		}
	}, {
		key: "clickNum",
		value: function clickNum(num) {
			var self = this;
			return function (e) {
				self.state.code = (self.state.code || "") + num;
				e.target.blur();
				self.forceUpdate();
			};
		}
	}, {
		key: "clear",
		value: function clear() {
			this.state.code = "";
			this.forceUpdate();
		}
	}, {
		key: "login",
		value: function login() {
			var self = this;
			cli.login(this.state.code, function (err) {
				self.state.code = "";
				if (err) {
					self.state.showPinError = true;
					self.forceUpdate();
					return;
				}
				if (client.hasPermission("outerdoor")) self.client.devices.outerdoor.setLocked(false);
				if (client.hasPermission("innerdoor")) setTimeout(function () {
					self.client.devices.innerdoor.setLocked(false);
				}, 2000);
				self.forceUpdate();
				logoutTimeout = setTimeout(function () {
					client.deleteSession(function () {
						self.forceUpdate();
					});
				}, 30000);
			});
		}
	}, {
		key: "openGate",
		value: function openGate() {
			this.client.devices.gate.open();
		}
	}, {
		key: "stopGate",
		value: function stopGate() {
			this.client.devices.gate.stop();
		}
	}, {
		key: "closeGate",
		value: function closeGate() {
			this.client.devices.gate.close();
		}
	}, {
		key: "allOff",
		value: function allOff() {
			this.client.devices.alloff.off();
		}
	}, {
		key: "outdoorlightOn",
		value: function outdoorlightOn() {
			this.client.devices.outdoorlight.turnOn();
		}
	}, {
		key: "outdoorlightOff",
		value: function outdoorlightOff() {
			this.client.devices.outdoorlight.turnOff();
		}
	}, {
		key: "closePinError",
		value: function closePinError() {
			delete this.state.showPinError;
			this.forceUpdate();
		}
	}, {
		key: "lockDoors",
		value: function lockDoors() {
			if (client.hasPermission("innerdoor")) this.client.devices.innerdoor.setAutoLock(true);
			if (client.hasPermission("outerdoor")) this.client.devices.outerdoor.setAutoLock(true);
		}
	}, {
		key: "unlockDoors",
		value: function unlockDoors() {
			if (client.hasPermission("innerdoor")) this.client.devices.innerdoor.setAutoLock(false);
			if (client.hasPermission("outerdoor")) this.client.devices.outerdoor.setAutoLock(false);
		}
	}, {
		key: "bellRing",
		value: function bellRing() {
			this.client.devices.bell.ring();
		}
	}, {
		key: "bellLight",
		value: function bellLight() {
			this.client.devices.bell.light();
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var DeviceClient = require("../client/index");
var client = require("require")("boxify/lib/client.js");
var Modal = require("require")("boxify/lib/views/Modal.js");
var cli = require("../client");

var logoutTimeout;

},{"../client":"/control-center/lib/plugin/client/client.js","../client/index":"/control-center/lib/plugin/client/client/index.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/client/views/tablet-stairs.js":[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var jade2react = require("jade2react");

var Base = require("./tablet-indoor");

var Component = function (_Base) {
	_inherits(Component, _Base);

	_createClass(Component, [{
		key: "_render",
		value: function _render(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "_render", this).call(this, __add);
		}
	}, {
		key: "render",
		value: function render() {
			return jade2react.render(this, this._render)[0];
		}
	}, {
		key: "content",
		value: function content(__add) {
			_get(Component.prototype.__proto__ || Object.getPrototypeOf(Component.prototype), "content", this).call(this, __add);
			__add(React.createFactory('style'), { "dangerouslySetInnerHTML": { __html: "h1{" + "\n" + "    text-align:center;" + "\n" + "}" + "\n" + ".btn{" + "\n" + "    width:100%;" + "\n" + "    font-size:30px;" + "\n" + "    line-height:60px;" + "\n" + "    margin-top:30px;" + "\n" + "}" } });
			__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Tor");
				});
				__add(React.createFactory('div'), { "onClick": this.gateOpen.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Auf");
				});
				__add(React.createFactory('div'), { "onClick": this.gateStop.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Stop");
				});
				__add(React.createFactory('div'), { "onClick": this.gateClose.bind(this), "className": 'btn' + " " + 'btn-primary' }, function (__add) {
					__add("Zu");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Lager Licht");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("An");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightHalfOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Halb");
				});
				__add(React.createFactory('div'), { "onClick": this.mainlightOff.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Aus");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Aussen Licht");
				});
				__add(React.createFactory('div'), { "onClick": this.outdoorlightOn.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("An");
				});
				__add(React.createFactory('div'), { "onClick": this.outdoorlightOff.bind(this), "className": 'btn' + " " + 'btn-success' }, function (__add) {
					__add("Aus ");
				});
			});
			__add(React.createFactory('div'), { "className": 'col-xs-3' }, function (__add) {
				__add(React.createFactory('h1'), {}, function (__add) {
					__add("Lager");
				});
				__add(React.createFactory('div'), { "onClick": this.sonosPlay.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Sonos play");
				});
				__add(React.createFactory('div'), { "onClick": this.lockDoors.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Verriegeln");
				});
				__add(React.createFactory('div'), { "onClick": this.unlockDoors.bind(this), "className": 'btn' + " " + 'btn-warning' }, function (__add) {
					__add("Entriegeln");
				});
				__add(React.createFactory('div'), { "onClick": this.goHome.bind(this), "className": 'btn' + " " + 'btn-danger' }, function (__add) {
					__add("Go Home");
				});
			});
			if (this.state.goHomeCountdown) {
				__add(React.createFactory(Modal), {}, function (__add) {
					__add(React.createFactory('div'), { "className": 'modal-header' }, function (__add) {
						__add(React.createFactory('h2'), {}, function (__add) {
							__add("Selbstzerstörung in " + this.state.goHomeCountdown + "s...");
						});
					});
					__add(React.createFactory('div'), { "className": 'modal-footer' }, function (__add) {
						__add(React.createFactory('button'), { "onClick": this.abortGoHome.bind(this), "className": 'btn' + " " + 'btn-default' }, function (__add) {
							__add("Abbrechen");
						});
					});
				});
			}
		}
	}]);

	function Component(props, context) {
		_classCallCheck(this, Component);

		var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, props, context));

		_this.listen = true;
		return _this;
	}

	_createClass(Component, [{
		key: "getNeededPermissions",
		value: function getNeededPermissions() {
			return ["mainlight", "workshoplight", "outdoorlight", "outerdoor", "innerdoor", "officelight", "sonos"];
		}
	}, {
		key: "gateOpen",
		value: function gateOpen() {
			this.client.devices.gate.open();
		}
	}, {
		key: "gateClose",
		value: function gateClose() {
			this.client.devices.gate.close();
		}
	}, {
		key: "gateStop",
		value: function gateStop() {
			this.client.devices.gate.stop();
		}
	}, {
		key: "goHome",
		value: function goHome() {
			if (checkDark()) {
				this.outdoorlightOn();
			}
			this.state.goHomeCountdown = 30;
			this.goHomeInterval = setInterval(function () {
				if (--this.state.goHomeCountdown <= 0) {
					clearInterval(this.goHomeInterval);
					this.mainlightOff();
					this.client.devices.workshoplight.turnOff();
					this.lockDoors();
					this.sonosPause();
					this.client.devices.officelight.setSceneByName("Aus");
					setTimeout(function () {
						this.outdoorlightOff();
					}.bind(this), 3 * 60 * 1000);
				}
				this.forceUpdate();
			}.bind(this), 1000);
			this.forceUpdate();
		}
	}, {
		key: "abortGoHome",
		value: function abortGoHome() {
			clearInterval(this.goHomeInterval);
			delete this.state.goHomeCountdown;
			this.forceUpdate();
		}
	}, {
		key: "mainlightOn",
		value: function mainlightOn() {
			this.client.devices.mainlight.turnOn();
		}
	}, {
		key: "mainlightHalfOn",
		value: function mainlightHalfOn() {
			this.client.devices.mainlight.turnHalfOn();
		}
	}, {
		key: "mainlightOff",
		value: function mainlightOff() {
			this.client.devices.mainlight.turnOff();
		}
	}, {
		key: "outdoorlightOn",
		value: function outdoorlightOn() {
			this.client.devices.outdoorlight.turnOn();
		}
	}, {
		key: "outdoorlightOff",
		value: function outdoorlightOff() {
			this.client.devices.outdoorlight.turnOff();
		}
	}, {
		key: "sonosPlay",
		value: function sonosPlay() {
			this.client.devices.sonos.play();
		}
	}, {
		key: "sonosPause",
		value: function sonosPause() {
			this.client.devices.sonos.pause();
		}
	}, {
		key: "lockDoors",
		value: function lockDoors() {
			this.client.devices.innerdoor.setAutoLock(true);
			this.client.devices.outerdoor.setAutoLock(true);
		}
	}, {
		key: "unlockDoors",
		value: function unlockDoors() {
			this.client.devices.innerdoor.setAutoLock(false);
			this.client.devices.outerdoor.setAutoLock(false);
		}
	}]);

	return Component;
}(Base);

module.exports = Component;

var DeviceClient = require("../client/index");
var checkDark = require("../../../service/checkDark");
var Modal = require("require")("boxify/lib/views/Modal.js");

},{"../../../service/checkDark":"/control-center/lib/service/checkDark.js","../client/index":"/control-center/lib/plugin/client/client/index.js","./tablet-indoor":"/control-center/lib/plugin/client/views/tablet-indoor.js","jade2react":"/control-center/node_modules/jade2react/lib/client.js","react":"/control-center/lib/node_modules/react.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/plugin/routes.js":[function(require,module,exports){
"use strict";

var _require = require;
var routes = require("require")("boxify/lib/routes.js");
require = function require(path) {
	try {
		window;
		var val = _require(path);
		return val;
	} catch (e) {}
};

routes["/electronic"] = require("./client/views/electronic.js");
routes["/pins"] = require("./client/views/pins.js");
routes["/tablet-office"] = require("./client/views/tablet-office.js");
routes["/tablet-stairs"] = require("./client/views/tablet-stairs.js");
routes["/tablet-bistro"] = require("./client/views/tablet-bistro.js");
routes["/tablet-outdoor"] = require("./client/views/tablet-outdoor.js");

},{"./client/views/electronic.js":"/control-center/lib/plugin/client/views/electronic.js","./client/views/pins.js":"/control-center/lib/plugin/client/views/pins.js","./client/views/tablet-bistro.js":"/control-center/lib/plugin/client/views/tablet-bistro.js","./client/views/tablet-office.js":"/control-center/lib/plugin/client/views/tablet-office.js","./client/views/tablet-outdoor.js":"/control-center/lib/plugin/client/views/tablet-outdoor.js","./client/views/tablet-stairs.js":"/control-center/lib/plugin/client/views/tablet-stairs.js","require":"/control-center/lib/node_modules/require.js"}],"/control-center/lib/service/checkDark.js":[function(require,module,exports){
"use strict";

var suncalc = require("suncalc");

var lat = 47.170519;
var long = 8.283809;

module.exports = function (from, to) {
    var now = new Date();
    var times = suncalc.getTimes(now, lat, long);

    if (times.sunriseEnd.getDate() != now.getDate()) {
        times.sunriseEnd = new Date(times.sunriseEnd.getFullYear(), times.sunriseEnd.getMonth(), now.getDate(), times.sunriseEnd.getHours(), times.sunriseEnd.getMinutes());
        times.sunsetStart = new Date(times.sunsetStart.getFullYear(), times.sunsetStart.getMonth(), now.getDate(), times.sunsetStart.getHours(), times.sunsetStart.getMinutes());
    }

    var beforeSunrise = now.getTime() < times.sunriseEnd.getTime();
    var afterSunset = now.getTime() > times.sunsetStart.getTime();

    var dark = beforeSunrise || afterSunset;
    if (from && to && dark && beforeSunrise) {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), from);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), to);
        return now.getTime() < from.getTime() || now.getTime() >= to.getTime();
    } else {
        return dark;
    }
};

},{"suncalc":"/control-center/node_modules/suncalc/suncalc.js"}],"/control-center/node_modules/cookies-js/dist/cookies.js":[function(require,module,exports){
/*
 * Cookies.js - 1.2.2
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }
            
            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];

            return value === undefined ? undefined : decodeURIComponent(value);
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            var key = cookieString.substr(0, separatorIndex);
            var decodedKey;
            try {
                decodedKey = decodeURIComponent(key);
            } catch (e) {
                if (console && typeof console.error === 'function') {
                    console.error('Could not decode cookie with key "' + key + '"', e);
                }
            }
            
            return {
                key: decodedKey,
                value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],"/control-center/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/control-center/node_modules/jade2react/lib/client.js":[function(require,module,exports){
function render(self,renderBody){
    var children = [];
    renderBody.call(self,function(component,attributes,sub){
        if(component instanceof Function){
            children.push(component.apply(component,sub?[attributes].concat(render(self,sub)):[attributes]));
        }else{
            children.push(component);
        }
    });
    return children;
}

function mixin(source,target){
    for(var key in source){
        target[key] = source[key];
    }
}

function mixinAttributes(target,blocks){
    for(var i = 0; i < blocks.length; i++){
        mixin(blocks[i],target);
    }
    return target;
}

function mapStyle(style){
    if(typeof style == "object") return style;
    var defs = (style+"").split(";");
    style = {};
    for(var def in defs){
        def = defs[def].split(":");
        style[def[0]] = def[1];
    }
    return style;
}

exports.render = render;
exports.mixin = mixin;
exports.mixinAttributes = mixinAttributes;
exports.mapStyle = mapStyle;

},{}],"/control-center/node_modules/moment/moment.js":[function(require,module,exports){
//! moment.js
//! version : 2.14.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        return Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        var k;
        for (k in obj) {
            // even if its not own property I'd still call it non-empty
            return false;
        }
        return true;
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (utils_hooks__hooks.deprecationHandler != null) {
                utils_hooks__hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(arguments).join(', ') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (utils_hooks__hooks.deprecationHandler != null) {
            utils_hooks__hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;
    utils_hooks__hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function units_month__handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = create_utc__createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return units_month__handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function day_of_week__handleStrictParse(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = create_utc__createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = create_utc__createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        ordinalParse: defaultOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    // treat as if there is no base config
                    deprecateSimple('parentLocaleUndefined',
                            'specified parentLocale is not defined yet. See http://momentjs.com/guides/#/warnings/parent-locale/');
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, parentConfig = baseConfig;
            // MERGE
            if (locales[name] != null) {
                parentConfig = locales[name]._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (isDate(input)) {
            config._d = input;
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(matchOffset, this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = utils_hooks__hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
            case 'date':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIOROITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = stringGet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = stringSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    momentPrototype__proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var prototype__proto = Locale.prototype;

    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto.ordinal         = ordinal;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    prototype__proto.weekdaysRegex       =        weekdaysRegex;
    prototype__proto.weekdaysShortRegex  =        weekdaysShortRegex;
    prototype__proto.weekdaysMinRegex    =        weekdaysMinRegex;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = lists__get(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = locale_locales__getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return lists__get(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function lists__listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function lists__listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function lists__listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function lists__listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function duration_humanize__getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.14.1';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.updateLocale          = updateLocale;
    utils_hooks__hooks.locales               = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeRounding = duration_humanize__getSetRelativeTimeRounding;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.calendarFormat        = getCalendarFormat;
    utils_hooks__hooks.prototype             = momentPrototype;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
},{}],"/control-center/node_modules/suncalc/suncalc.js":[function(require,module,exports){
/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

(function () { 'use strict';

// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }


// general sun calculations

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = sunCoords(d),
        H  = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date and latitude/longitude

SunCalc.getTimes = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];

        Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec);

    // altitude correction for refraction
    h = h + rad * 0.017 / tan(h + rad * 10.26 / (h + rad * 5.10));

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
};


// export as AMD module / Node module / browser variable
if (typeof define === 'function' && define.amd) define(SunCalc);
else if (typeof module !== 'undefined') module.exports = SunCalc;
else window.SunCalc = SunCalc;

}());

},{}]},{},[]);
