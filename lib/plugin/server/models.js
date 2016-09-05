var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = function(db){
    db.Pin = db.model("pins",{
        _id: {type:Number,ref:"contacts"},
        pin: String,
        full: Boolean,
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
