var mount = require("koa-mount");
var compose = require("koa-compose");

module.exports = compose([mount("/pins", require("./pins"))]);
