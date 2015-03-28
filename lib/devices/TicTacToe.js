var Device = require("../device.js");
var hue = require("node-hue-api");
var async = require("async");

var TicTacToe = module.exports = function TicTacToe(user,officelight){
    Device.call(this);

    this.officelight = officelight;
    hue.nupnpSearch(function(err, result) {
        if (err) throw err;
        this.api = new hue.HueApi(result[0].ipaddress,user);
        this.restart();
    }.bind(this));
    this.lamps = [
        [9,6,3],
        [8,5,2],
        [7,4,1]
    ];
    this.off = hue.lightState.create().off();
    this.green = hue.lightState.create().on().rgb(0,255,0)
    this.red = hue.lightState.create().on().rgb(255,0,0)
    this.set("player",1);
    this.command("turn",this.turn.bind(this));
}

TicTacToe.prototype = Object.create(Device.prototype);

TicTacToe.prototype.restart = function(){
    this.set("field",[[false,false,false],[false,false,false],[false,false,false]]);
}

TicTacToe.prototype.turn = function(player,x,y){
    if(this.state.player == player && !this.state.field[x][y]){
        this.state.field[x][y] = player;
        this.set("field",this.state.field);
        this.set("player",player==1?2:1);
        this.api.setLightState(this.lamps[x][y],this.color(player),function(err){
            var winner = this.findWinner();
            if(winner){
                this.turnOff(function(){
                    if(winner != 3){
                        this.flash(winner.player,winner.lights,function(){
                            this.restart();
                        }.bind(this));
                    }else{
                        this.restart();
                    }
                }.bind(this));
            }
        }.bind(this))
    }
}

TicTacToe.prototype.check = function(x1,y1,x2,y2,x3,y3){
    if(this.state.field[x1][y1] == this.state.field[x2][y2] && this.state.field[x1][y1] == this.state.field[x3][y3]) return this.state.field[x1][y1];
    return false;
}

TicTacToe.prototype.findWinner = function(){
    var checks = [
        [0,0,1,0,2,0],
        [0,1,1,1,2,1],
        [0,2,1,2,2,2],
        [0,0,0,1,0,2],
        [1,0,1,1,1,2],
        [2,0,2,1,2,2],
        [0,0,1,1,2,2],
        [2,0,1,1,0,2]
    ];
    for(var i = 0; i < checks.length; i++){
        var winner = this.check.apply(this,checks[i]);
        if(winner) return {player:winner,lights:[
            this.lamps[checks[i][0]][checks[i][1]],
            this.lamps[checks[i][2]][checks[i][3]],
            this.lamps[checks[i][4]][checks[i][5]]
        ]};
    }
    for(var x = 0; x < 3; x++){
        for(var y = 0; y < 3; y++){
            if(!this.state.field[x][y]) return;
        }
    }
    return 3;
}

TicTacToe.prototype.flash = function(player,lights,cb){
    var self = this;
    var color = this.color(player);
    var repeat = 4;

    function cycle(){
        if(repeat-- > 0){
            async.eachSeries(lights,function(light,cb){
                self.api.setLightState(light,color,cb)
            },function(){
                setTimeout(function(){
                    async.eachSeries(lights,function(light,cb){
                        self.api.setLightState(light,self.off,cb)
                    },function(){
                        setTimeout(cycle,500)
                    })
                },500);
            })
        }else{
            cb();
        }
    }
    cycle();
}

TicTacToe.prototype.color = function(player){
    switch(player){
        case false:
            return this.off;
        case 1:
            return this.green;
        case 2:
            return this.red;
    }
}

TicTacToe.prototype.turnOff = function(cb){
    this.officelight.setScene("node-hue-api-6",cb);
}

TicTacToe.prototype.fun = function(){
    var self = this;
    async.each([1,4,7,8,9,6,3,2],function(id,cb){
        self.api.setLightState(id,hue.lightState.create().on(),function(){
            self.api.setLightState(id,hue.lightState.create().off(),cb)
        });
    },self.fun.bind(self))
}
