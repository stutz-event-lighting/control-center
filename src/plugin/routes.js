var _require = require;
var routes = require("require")("boxify/lib/routes.js");
require = function(path){
	try{
		window;
		var val =  _require(path);
		return val;
	}catch(e){
	}
}

routes["/electronic"] = require("./client/views/electronic.js");
routes["/pins"] = require("./client/views/pins.js");
routes["/tablet-office"] = require("./client/views/tablet-office.js");
routes["/tablet-stairs"] = require("./client/views/tablet-stairs.js");
routes["/tablet-bistro"] = require("./client/views/tablet-bistro.js");
routes["/tablet-outdoor"] = require("./client/views/tablet-outdoor.js");
