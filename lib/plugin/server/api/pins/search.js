module.exports = function*(){
    var pins = yield this.app.db.model("pins").find({}).populate("_id");
    for(var pin of pins){
        if(pin._id.roles.indexOf("user") >= 0) pin.pin = "";
    }
    this.set("Content-Type","application/json");
    this.body = JSON.stringify(pins);
};
