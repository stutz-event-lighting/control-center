var mongo = require("mongodb");
var parse = require("co-body");
module.exports = function*(){
    var body = yield parse.json(this);
    var pin = new this.app.db.Pin({
        _id:body._id,
        pin:body.pin,
        full:body.full,
        rules:[]
    });
    pin = yield pin.save();

    this.set("Content-Type","text/plain");
    this.body = JSON.stringify(pin._id);
};
