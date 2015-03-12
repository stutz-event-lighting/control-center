var net = require("net");
var byline = require("byline");
module.exports = function(config,c){
    var con = net.connect(config.port,config.host,function(){
        byline(con).on("data",function(line){
            c.send(line+"\r\n");
        });
        con.on("end",function(){
            c.close();
        });
        con.write(JSON.stringify({username:config.username,password:config.password})+"\r\n");
        c.on("message",function(msg){
            con.write(msg+"\r\n");
        })
        c.on("close",function(){
            con.end();
        })
        c.on("error",function(){})
    }).on("error",function(){
        c.close();
    });
}
