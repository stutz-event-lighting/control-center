var mongo = require("mongodb");
var parse = require("co-body");
module.exports = async function(ctx){
    var body = await parse.json(ctx);
    var db = await ctx.app.db.Pin.update({_id:parseFloat(ctx.params.pin)},{$set:body});
    ctx.status = 200;
};
