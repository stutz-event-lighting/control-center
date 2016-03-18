module.exports = require("co-express")(function*(req,res){
    yield req.app.db.Pin.remove({_id:parseFloat(req.params.pin)});
    res.end();
});
