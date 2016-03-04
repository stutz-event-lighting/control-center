var mongo = require("mongodb");
module.exports = require("co-express")(function*(req,res){
    var pin = yield req.app.db.model("pins").findById(mongo.ObjectID(req.params.pin)).exec();
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(pin));
});
