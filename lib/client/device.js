var Device = module.exports = function Device(conn,name,commands,state){
    this.connection = conn;
    this.name = name;
    this.state = state;
    for(var i = 0; i < commands.length; i++){
        (function(command){
            this[command] = function(){
                conn.send(JSON.stringify({device:this.name,name:command,params:Array.prototype.slice.call(arguments)})+"\r\n");
            }
        }).bind(this)(commands[i])
    }
}

Device.prototype.updateState = function(state){
    this.state = state;
}
