var suncalc = require("suncalc");
var moment = require("moment");

var lat = 47.170519;
var long = 8.283809;

module.exports = function(){
    var now = new Date();
    var times = suncalc.getTimes(now,lat,long);
    return now.getTime() < times.sunriseEnd.getTime() && now.getTime() > times.sunsetStart.getTime();
}
