var router = require("koa-router")();

module.exports = router
	.post("",require("./create.js"))
	.get("",require("./search.js"))
	.post("/login",require("./login.js"))
	.patch("/:pin",require("./update.js"))
	.delete("/:pin",require("./delete.js"))
	.middleware();
