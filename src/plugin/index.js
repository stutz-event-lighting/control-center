exports.server = function(boxify,config){
	exports.client();
	return new (require("./server"+""))(boxify,config);
}
exports.client = function(){
	require("./client");
}
