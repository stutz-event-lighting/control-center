module.exports = async function (ctx) {
  await ctx.db.Pin.remove({ _id: ctx.params.pin });
  ctx.status = 200;
};
