var http = require("http");
var request = require("co-request");

module.exports = async function (ip,url){
    try{
        var res = await request({uri:"http://"+ip+":8080/display",method:"POST",headers:{"Content-Type":"text/plain","Content-Length:":url.lenght},body:url})
        console.log("updated tablet "+ip);
    }catch(e){
        console.log("could not reach tablet",ip);
    }
}
