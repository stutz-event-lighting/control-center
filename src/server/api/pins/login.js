var mongo = require("mongodb");
var parse = require("co-body");
var crypto = require("crypto");
module.exports = async function (ctx) {
  var body = await parse.json(ctx);

  var now = new Date();
  var date = now.getTime();
  var time = now.getTime() % (1000 * 60 * 60 * 24);
  var day = now.getDay() - 1;
  if (day < 0) day = 6;

  var pin = await ctx.db
    .model("pins")
    .findOne({ pin: body.pin })
    .populate("_id");

  if (!pin) ctx.throw(403);

  if (pin.rules && pin.rules.length) {
    for (var rule of pin.rules) {
      if (
        (rule.days && rule.days.length && rule.days.indexOf(day) < 0) ||
        (rule.from && rule.from > date) ||
        (rule.to && rule.to < date) ||
        (rule.timeFrom && rule.timeFrom > time) ||
        (rule.timeTo && rule.timeTo < time)
      ) {
        ctx.throw(403);
      }
    }
  }

  ctx.set("Content-Type", "application/json");
  ctx.body = pin;
};
