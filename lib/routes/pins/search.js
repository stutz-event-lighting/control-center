module.exports = require("co-express")(function*(req,res){
    var pins = yield req.app.db.model("pins").find({}).populate("contact").exec();
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(pins));
});
