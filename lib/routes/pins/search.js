module.exports = require("co-express")(function*(req,res){
    var pins = yield req.app.db.model("pins").find({}).populate("_id").exec();
    for(var pin of pins){
        if(pin._id.roles.indexOf("user") >= 0) pin.pin = "";
    }
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(pins));
});
