var parse = require("co-body");
module.exports = async function (ctx) {
  var body = await parse.json(ctx);
  await ctx.db.Pin.update({ _id: ctx.params.pin }, { $set: body });
  ctx.status = 200;
};
