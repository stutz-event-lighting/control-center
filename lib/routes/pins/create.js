var mongo = require("mongodb");
var parse = require("co-body");
module.exports = require("co-express")(function*(req,res){
    var body = yield parse.json(this);
    var pin = new req.app.db.Pin({
        contact:mongo.ObjectID(body.contact),
        pin:body.pin,
        rules:[]
    });
    pin = yield pin.save();

    res.writeHead(200,{"Content-Type":"text/plain"});
    res.end(JSON.stringify(pin._id));
});
