module.exports = function*(){
    yield this.app.db.Pin.remove({_id:parseFloat(this.params.pin)});
    this.status = 200;
};
