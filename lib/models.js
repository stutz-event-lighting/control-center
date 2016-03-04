var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = function(db){
    db.Pin = db.model("pins",{
        pin: String,
        contact: {type:Number,ref:"contacts"},
        rules: [{
            from: Number,
            to: Number,
            days: [
                Number
            ],
            timeFrom: Number,
            timeTo: Number
        }]
    })
}
