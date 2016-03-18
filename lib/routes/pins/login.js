var mongo = require("mongodb");
var parse = require("co-body");
module.exports = require("co-express")(function*(req,res){
    var body = yield parse.json(req);

    var now = new Date();
    var date = now.getTime();
    var time = now.getTime()% (1000*60*60*24);
    var day = now.getDay()-1;
    if(day < 0) day = 6;

    var pin = yield req.app.db.model("pins").findOne({pin:body.pin,}).populate("_id").exec();

    if(!pin) return res.fail(600);

    if(pin.rules && pin.rules.length){
        for(var rule of pin.rules){
            if(
                (rule.days && rule.days.length && rule.days.indexOf(day) < 0) ||
                (rule.from && rule.from > date) ||
                (rule.to && rule.to < date) ||
                (rule.timeFrom && rule.timeFrom > time) ||
                (rule.timeTo && rule.timeTo < time)
            ){
                return res.fail(600);
            }
        }
    }

    var session = new req.app.db.Session({
        _id: mongo.ObjectID(),
        user:pin._id._id,
        permissions:["gate","outdoorlight","alloff","innerdoor","outerdoor"].filter(function(p){
            return pin._id.permissions.indexOf(p) >= 0;
        })
    })

    yield session.save();
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(session));
});
