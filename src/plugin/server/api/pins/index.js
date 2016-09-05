var router = require("koa-router")();

module.exports = router
	.post("/create",require("./create.js"))
	.post("",require("./search.js"))
	.post("/login",require("./login.js"))
	.post("/:pin/update",require("./update.js"))
	.get("/:pin/delete",require("./delete.js"))
	.middleware();
