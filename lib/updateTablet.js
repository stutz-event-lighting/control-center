var http = require("http");
var request = require("co-request");
var sleep = require("co-sleep");
var co = require("co");

module.exports = co.wrap(function* (ip,url){
    try{
        var res = yield request({uri:"http://"+ip+":8080/display",method:"POST",headers:{"Content-Type":"text/plain","Content-Length:":url.lenght},body:url})
        console.log("updated tablet "+ip);
    }catch(e){
        console.log("could not reach tablet",ip);
    }
});
