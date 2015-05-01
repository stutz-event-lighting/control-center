var http = require("http");

var Tablet = module.exports = function Tablet(ip,url){
    this.ip = ip;
    this.url = url;

    this.update();
}

Tablet.prototype.update = function(cb){
    var req = http.request({
        host:this.ip,
        port:8080,
        method:"POST",
        path:"/display",
        headers:{
            "Content-Type":"text/plain",
            "Content-Length":this.url.length
        }
    },function(res){
        res.on("end",function(){
            cb();
        });
    }).on("error",function(){}).end(this.url);
}
