module.exports = async function (ctx) {
  var pins = await ctx.db.model("pins").find({});
  ctx.set("Content-Type", "application/json");
  ctx.body = JSON.stringify(pins);
};
