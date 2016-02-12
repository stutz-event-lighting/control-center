var checkDark = require("../checkDark.js");


//this controller turns on the mainlight when someone opens the innerdor

module.exports = function(controller){
    controller.devices.innerdoor.on("change",function(){
        var state = controller.devices.innerdoor.getState();
        if(!state.open) return;
        if(controller.devices.mainlight.getState().status != "off") return;
        controller.devices.mainlight.turnHalfOn();
    });
}
