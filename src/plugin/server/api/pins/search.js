module.exports = async function(ctx){
    var pins = await ctx.app.db.model("pins").find({}).populate("_id");
    for(var pin of pins){
        if(pin._id.roles.indexOf("user") >= 0) pin.pin = "";
    }
    ctx.set("Content-Type","application/json");
    ctx.body = JSON.stringify(pins);
};
