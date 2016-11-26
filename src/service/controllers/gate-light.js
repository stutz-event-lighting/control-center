var checkDark = require("../checkDark");

/*
	this controller
		- turns the mainlight half on when the gate starts to open
		- turns the outdoorlight on at night, when the gate starts to open
*/

module.exports = function(controller){
	controller.gate.on("change",function(){
		if(controller.gate.state == "opening"){
			if(controller.mainlight.state.status == "off") controller.mainlight.turnHalfOn();
			if(checkDark() && !controller.outdoorlight.state.on) controller.outdoorlight.turnOn();
		}
	});
}
