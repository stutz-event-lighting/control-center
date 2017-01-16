var checkDark = require("../checkDark");

/*
	this controller
		- turns the mainlight half on when the gate starts to open
		- turns the outdoorlight on at night, when the gate starts to open
*/

module.exports = function(controller){
	controller.devices.gate.on("change",function(){
		if(controller.devices.gate.state == "opening"){
			if(controller.devices.mainlight.state.status == "off") controller.devices.mainlight.turnHalfOn();
			if(checkDark() && !controller.devices.outdoorlight.state.on) controller.devices.outdoorlight.turnOn();
		}
	});
}
