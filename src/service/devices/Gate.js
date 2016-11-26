var Device = require("../device.js");
var checkDark = require("../checkDark.js");

class Gate extends Device{
    constructor(button,io_closed,io_open,relay_open,relay_close){
        this.direction = "up";
        this.button = button;
        this.io_open = io_open;
        this.io_closed = io_closed;
        this.relay_open = relay_open;
        this.relay_close = relay_close;
        this.inaction = false;

        this.set("state",!this.io_open.value?"open":(!this.io_closed.value?"closed":"stopped"));

        this.button.on("change",()=>{
            if(!this.button.value){
                this.press();
            }
        });
        this.io_open.on("change",()=>{
            if(!this.io_open.value){
                this.set("state","open");
                this.direction = "up";
            }else if(this.state.state == "open"){
                this.set("state","closing");
            }
        })
        this.io_closed.on("change",()=>{
            if(!this.io_closed.value){
                this.set("state","closed");
                this.direction = "down";
            }else {
                if(this.state.state == "closed"){
                    this.set("state","opening");
                }
            }
        })
    }

    press(){
        switch(this.state.state){
            case "open":
                this.close();
                break;
            case "closed":
                this.open();
                break;
            case "stopped":
                if(this.direction == "up"){
                    this.open();
                }else{
                    this.close();
                }
                break;
            case "opening":
                this.stop();
                break;
            case "closing":
                this.stop();
                break;
        }
    }

    async impulse(relay){
        if(this.inaction) return;
        this.inaction = true;
        await relay.set(true);
        await relay.set(false);
        this.inaction = false;
    }

    async open(){
        if(this.inaction) return;
        if(this.state.state == "closing"){
            await this.stop();
        }
        await this.impulse(this.relay_open);
        this.set("state","opening");

    }

    async close(){
        if(this.inaction) return;
        if(this.state.state == "opening"){
            await this.stop();
        }
        await this.impulse(this.relay_close);
        this.set("state","closing");

    }

    async stop(){
        if(this.inaction) return;
        if(this.state.state == "opening"){
            await this.impulse(this.relay_close);
            this.set("state","stopped");
            this.direction = "down";
        }else if(this.state.state == "closing"){
            await this.impulse(this.relay_open);
            this.set("state","stopped");
            this.direction = "up";
        }
    }
}

module.exports = Gate;
