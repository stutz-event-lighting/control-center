var fs = require("fs");
var Controller = require("./lib/service");
var config = JSON.parse(fs.readFileSync("./config.json"));

var controller = new Controller(config);
controller.start();
