var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var pin = new ctx.app.db.Pin({
        _id:body._id,
        pin:body.pin,
        full:body.full,
        rules:[]
    });
    pin = await pin.save();

    ctx.set("Content-Type","text/plain");
    ctx.body = JSON.stringify(pin._id);
};
