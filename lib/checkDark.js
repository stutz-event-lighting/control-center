var suncalc = require("suncalc");

var lat = 47.170519;
var long = 8.283809;

module.exports = function(max){
    var now = new Date();
    max = max?new Date(now.getFullYear(),now.getMonth(),now.getDate(),max):false;
    var times = suncalc.getTimes(now,lat,long);

    var beforeSunrise = now.getTime() < times.sunriseEnd.getTime();
    var afterSunset = now.getTime() > times.sunsetStart.getTime();

    var dark = beforeSunrise || afterSunset;

    if(max && dark && beforeSunrise){
        return now.getTime() < max.getTime();
    }else{
        return dark;
    }
}
