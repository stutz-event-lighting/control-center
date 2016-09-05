var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var db = yield this.app.db.Pin.update({_id:parseFloat(this.params.pin)},{$set:body});
    this.status = 200;
};
