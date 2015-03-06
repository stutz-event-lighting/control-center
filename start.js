var fs = require("fs");
var electronic = require("./lib/index.js");
var config = JSON.parse(fs.readFileSync("./config.json"));

var controller = new electronic.Controller(config);
controller.start();
