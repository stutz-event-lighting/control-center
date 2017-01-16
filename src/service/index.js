var http = require("http");
var byline = require("byline");
var url = require("url");
var suncalc = require("suncalc");
var fs = require("fs-promise");
var path = require("path");
var Koa = require("koa");
var serve = require("koa-static");
var compose = require("koa-compose");
var mount = require("koa-mount");
var router = require("koa-router")();
var upgrade = require("koa-upgrade");
var parse = require("co-body");

require("babel-polyfill");

var HUT = require("./relais/hut.js");
var devices = require("../devices.js");
var checkDark = require("./checkDark.js");

// Devices
var AllOff = require("./devices/AllOff.js");
var Gate = require("./devices/Gate.js");
var MainLight = require("./devices/MainLight.js");
var OfficeLight = require("./devices/OfficeLight.js");
var Shutters = require("./devices/shutters.js");
var OutdoorLight = require("./devices/OutdoorLight.js");
var WorkshopLight = require("./devices/WorkshopLight.js");
var Sonos = require("./devices/Sonos.js");
var Door = require("./devices/Door.js");
var Bell = require("./devices/Bell.js");


class Controller{
    constructor(config){
        this.config = config;
        this.connections = [];
        this.devices = {};
        this.app = new Koa();

        upgrade(this.app);

        this.app.use(mount("/public",serve(path.resolve(__dirname,"../../public"))));
        this.app.use(router
            .get("/",async function(ctx){
                if(ctx.get("Connection") != "Upgrade") return;
                var c = await ctx.upgrade();
                this.onConnection(c);
                ctx.respond = false;
            }.bind(this))
            .get("/:device",async function(ctx){
                if(!this.devices[ctx.params.device]) return;
                ctx.set("Cotent-Type","application/json");
                ctx.body = JSON.stringify(this.devices[ctx.params.device].getState());
            }.bind(this))
            .post("/:device/:command",async function(ctx){
                var body = await parse.json(ctx);
                var device = this.devices[ctx.params.device];
                if(device && devices[ctx.params.device].commands.indexOf(ctx.params.command)>=0) await device[ctx.params.command].apply(device,body);
                ctx.status = 200;
            }.bind(this))
            .routes()
        );
    }
    async start(){
        var [r1,r2] = await Promise.all([
            async function(){
                var relais = new HUT("192.168.1.201",75,"admin","anel");
                await new Promise((s)=>relais.once("initialized",s));
                return relais;
            }(),
            async function(){
                var relais = new HUT("192.168.1.202",76,"admin","anel");
                await new Promise((s)=>relais.once("initialized",s));
                return relais;
            }()
        ]);

        this.addDevice("mainlight",new MainLight(r1.ios[3],r1.relays[4],r1.relays[5]));
        this.addDevice("outdoorlight",new OutdoorLight(r2.relays[3]));
        this.addDevice("gate",new Gate(r1.ios[2],r2.ios[1],r2.ios[0],r1.relays[6],r1.relays[7]));
        this.addDevice("outerdoor",new Door(r2.ios[2],r2.relays[4]));
        this.addDevice("innerdoor",new Door(r2.ios[3],r2.relays[5]));
        this.addDevice("officelight",new OfficeLight(this.config.hueuser));
        this.addDevice("sonos",new Sonos());
        this.addDevice("shutters",new Shutters(r2.relays[1],r2.relays[0]));
        this.addDevice("workshoplight",new WorkshopLight(r1.relays[0],r1.relays[1]));
        this.addDevice("alloff",new AllOff(r1.ios[4],this.devices.mainlight,this.devices.officelight,this.devices.outdoorlight,[r1.relays[0],r1.relays[1]],this.devices.sonos,this.devices.innerdoor,this.devices.outerdoor));
        this.addDevice("bell",new Bell(this.devices.outdoorlight,this.config.url));
        this.loadControllers(this).catch(function(err){console.log(err,"could not load controllers!")});
        this.outdoorLightLED = r2.relays[2];
        setInterval(this.setOutdoorTabletLEDState.bind(this),60*1000);
        this.setOutdoorTabletLEDState();

        this.app.listen(this.config.port);
    }

    addDevice(name,device){
        this.devices[name] = device;
        device.commands = devices[name].commands;
        device.on("change",()=>{
            var states = {};
            states[name] = device.getState();
            for(var i = 0; i < this.connections.length; i++){
                this.connections[i].send(JSON.stringify(states));
            }
        });
    }

    async loadControllers(){
        var controllers = await fs.readdir(path.resolve(__dirname,"./controllers"));
        for(var i = 0; i < controllers.length; i++){
            require("./controllers/"+controllers[i])(this);
        }
    }

    onConnection(c){
        var params = url.parse(c.upgradeReq.url,true).query;
        this.connections.push(c);
        c.on("close",()=>{
            this.connections.splice(this.connections.indexOf(c),1);
        });
        c.on("error",function(){})
        var states = {};
        for(var device in this.devices){
            states[device] = this.devices[device].getState();
        }
        c.send(JSON.stringify(states));
    }

    setOutdoorTabletLEDState(){
        var on = checkDark(1,5);
        this.outdoorLightLED.set(on)
        if(!on) this.devices.outdoorlight.turnOff();
    }
}

module.exports = Controller;
