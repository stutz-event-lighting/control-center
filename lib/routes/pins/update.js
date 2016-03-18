var mongo = require("mongodb");
var parse = require("co-body");
module.exports = require("co-express")(function*(req,res){
    var body = yield parse.json(req);
    var db = yield req.app.db.Pin.update({_id:parseFloat(req.params.pin)},{$set:body});
    res.end();
});
