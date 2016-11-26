module.exports = async function(ctx){
    await ctx.app.db.Pin.remove({_id:parseFloat(ctx.params.pin)});
    ctx.status = 200;
};
