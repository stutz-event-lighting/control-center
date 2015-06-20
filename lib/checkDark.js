var suncalc = require("suncalc");

var lat = 47.170519;
var long = 8.283809;

module.exports = function(from,to){
    var now = new Date();
    var times = suncalc.getTimes(now,lat,long);

    if(times.sunriseEnd.getDate() != now.getDate()){
        times.sunriseEnd = new Date(times.sunriseEnd.getFullYear(),times.sunriseEnd.getMonth(),now.getDate(),times.sunriseEnd.getHours(),times.sunriseEnd.getMinutes());
        times.sunsetStart = new Date(times.sunsetStart.getFullYear(),times.sunsetStart.getMonth(),now.getDate(),times.sunsetStart.getHours(),times.sunsetStart.getMinutes());
    }

    var beforeSunrise = now.getTime() < times.sunriseEnd.getTime();
    var afterSunset = now.getTime() > times.sunsetStart.getTime();

    var dark = beforeSunrise || afterSunset;
    if(from && to && dark && beforeSunrise){
        from = new Date(now.getFullYear(),now.getMonth(),now.getDate(),from);
        to = new Date(now.getFullYear(),now.getMonth(),now.getDate(),to);
        return now.getTime() < from.getTime() || now.getTime() >= to.getTime();
    }else{
        return dark;
    }
}
