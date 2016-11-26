var App = require("require")("boxify/lib/views/app.js");

App.router
	.add("plugin","/electronic",require("./views/electronic"))
	.add("plugin","/pins",require("./views/pins"))
	.add("rootPlugin","/tablet-office",require("./views/tablet-office"))
	.add("rootPlugin","/tablet-stairs",require("./views/tablet-stairs"))
	.add("rootPlugin","/tablet-bistro",require("./views/tablet-bistro"))
	.add("rootPlugin","/tablet-outdoor",require("./views/tablet-outdoor"))

App.menu.Elektronik = {url:"/electronic",loggedIn:true};
App.menu.Zugänge = {url:"/pins",loggedIn:true};

require("require")("boxify/lib/views/profile.js").extensionSections.push(require("./views/PinSection"));
