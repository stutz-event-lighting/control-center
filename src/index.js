var fs = require("fs");
const Controller = require("./server");

const controller = new Controller(
  JSON.parse(fs.readFileSync("./config.json") + "")
);
controller.start().catch((e) => console.error(e));
