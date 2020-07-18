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
var Router = require("koa-router");
var upgrade = require("koa-upgrade");
var parse = require("co-body");
var mongoose = require("mongoose");
var send = require("koa-send");

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

class Controller {
  constructor(config) {
    this.config = config;
    this.connections = [];
    this.devices = {};
    this.app = new Koa();

    this.db = mongoose.connect("mongodb://localhost:27017/control-center"); //TODO
    require("./models")(this.db);

    upgrade(this.app);

    this.app.use(
      mount(
        "/api",
        compose([
          async (ctx, next) => {
            const cookie = ctx.get("Cookie");
            if (!(cookie||"").includes("Password="+this.config.password)) {
              ctx.status = 401;
            } else {
              ctx.db = this.db;
              await next();
            }
          },
          require("./api"),
          mount(
            "/devices",
            Router()
              .get(
                "/",
                async function (ctx) {
                  if (!ctx.get("Connection").includes("Upgrade")) {
                    return;
                  }
                  // TODO authenticate!
                  var c = await ctx.upgrade();
                  this.onConnection(c);
                  ctx.respond = false;
                }.bind(this)
              )
              .get(
                "/:device",
                async function (ctx) {
                  // TODO authenticate
                  if (!this.devices[ctx.params.device]) return;
                  ctx.set("Cotent-Type", "application/json");
                  ctx.body = JSON.stringify(
                    this.devices[ctx.params.device].getState()
                  );
                }.bind(this)
              )
              .post(
                "/:device/:command",
                async function (ctx) {
                  //TODO authenticate
                  var body = await parse.json(ctx);
                  var device = this.devices[ctx.params.device];
                  if (
                    device &&
                    devices[ctx.params.device].commands.indexOf(
                      ctx.params.command
                    ) >= 0
                  )
                    await device[ctx.params.command].apply(device, body);
                  ctx.status = 200;
                }.bind(this)
              )
              .routes()
          ),
        ])
      )
    );
    this.app.use(
      mount("/public", serve(path.resolve(__dirname, "../../public")))
    );
    this.app.use(
      mount("/main.js", async (ctx) => {
        await send(ctx, "build.js", { root: path.resolve(__dirname, "../") });
      })
    );
    this.app.use(
      mount(
        "/public/bootstrap",
        serve(path.resolve(__dirname, "../../node_modules/bootstrap/dist"))
      )
    );
    this.app.use(
      mount(
        "/public/react-widgets",
        serve(path.resolve(__dirname, "../../node_modules/react-widgets/dist"))
      )
    );
    this.app.use(
      mount(
        "/public/react-select",
        serve(path.resolve(__dirname, "../../node_modules/react-select/dist"))
      )
    );
    this.app.use(async (ctx) => {
      ctx.set("Content-Type", "text/html");
      ctx.body = `
<!DOCTYPE html>
<html>
    <head>
        <title>AIOC Lager</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
        <link rel="stylesheet" type="text/css" href="/public/style.css"/>
        <link rel="icon" href="/public/icon.png" sizes="48x48" type="image/png"/>
    </head>
    <body>
        <script>window.onerror = function(message,a,line){alert(message+":"+line)}</script>
        <script src='/main.js'></script>
    </body>
</html>`;
    });
  }

  updateTablets() {
    setTimeout(() => {
      for (var ip in this.config.tablets) {
        updateTablet(ip, this.boxify.config.url + this.config.tablets[ip]);
      }
    }, 1000);
  }

  async start() {
    this.app.listen(this.config.port);
    console.log("listening on port", this.config.port);

    var [r1, r2] = await Promise.all([
      (async function () {
        var relais = new HUT("192.168.1.201", 75, "admin", "anel");
        await new Promise((s) => relais.once("initialized", s));
        return relais;
      })(),
      (async function () {
        var relais = new HUT("192.168.1.202", 76, "admin", "anel");
        await new Promise((s) => relais.once("initialized", s));
        return relais;
      })(),
    ]);

    this.addDevice(
      "mainlight",
      new MainLight(r1.ios[3], r1.relays[4], r1.relays[5])
    );
    this.addDevice("outdoorlight", new OutdoorLight(r2.relays[3]));
    this.addDevice(
      "gate",
      new Gate(r1.ios[2], r2.ios[1], r2.ios[0], r1.relays[6], r1.relays[7])
    );
    this.addDevice("outerdoor", new Door(r2.ios[2], r2.relays[4]));
    this.addDevice("innerdoor", new Door(r2.ios[3], r2.relays[5]));
    this.addDevice("officelight", new OfficeLight(this.config.hueuser));
    this.addDevice("sonos", new Sonos());
    this.addDevice("shutters", new Shutters(r2.relays[1], r2.relays[0]));
    this.addDevice(
      "workshoplight",
      new WorkshopLight(r1.relays[0], r1.relays[1])
    );
    this.addDevice(
      "alloff",
      new AllOff(
        r1.ios[4],
        this.devices.mainlight,
        this.devices.officelight,
        this.devices.outdoorlight,
        [r1.relays[0], r1.relays[1]],
        this.devices.sonos,
        this.devices.innerdoor,
        this.devices.outerdoor
      )
    );
    this.addDevice(
      "bell",
      new Bell(this.devices.outdoorlight, this.config.url)
    );
    this.loadControllers(this).catch(function (err) {
      console.log(err, "could not load controllers!");
    });
    this.outdoorLightLED = r2.relays[2];
    setInterval(this.setOutdoorTabletLEDState.bind(this), 60 * 1000);
    this.setOutdoorTabletLEDState();

    this.updateTablets();
  }

  addDevice(name, device) {
    this.devices[name] = device;
    device.commands = devices[name].commands;
    device.on("change", () => {
      var states = {};
      states[name] = device.getState();
      for (var i = 0; i < this.connections.length; i++) {
        this.connections[i].send(JSON.stringify(states));
      }
    });
  }

  async loadControllers() {
    var controllers = await fs.readdir(
      path.resolve(__dirname, "./controllers")
    );
    for (var i = 0; i < controllers.length; i++) {
      require("./controllers/" + controllers[i])(this);
    }
  }

  onConnection(c) {
    var params = url.parse(c.upgradeReq.url, true).query;
    this.connections.push(c);
    c.on("close", () => {
      this.connections.splice(this.connections.indexOf(c), 1);
    });
    c.on("error", function () {});
    var states = {};
    for (var device in this.devices) {
      states[device] = this.devices[device].getState();
    }
    c.send(JSON.stringify(states));
  }

  setOutdoorTabletLEDState() {
    var on = checkDark(1, 5);
    this.outdoorLightLED.set(on);
    if (!on) this.devices.outdoorlight.turnOff();
  }
}

module.exports = Controller;
