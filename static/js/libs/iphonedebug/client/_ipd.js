dojo.require("dojox.cometd");
dojo.require("dojox.cometd.timestamp");

dojox.cometd.init((ipdConfig.consoleBaseUrl + "console"));
function start(){
	dojox.cometd.publish("/mobile", "START", {
		userAgent: window.navigator.userAgent,
		href: window.location.href
	});
	dojox.cometd.subscribe("/mobile", function(msg) {
		if(msg.data == "RESET") {
			stop();
			start();
		} else {
			if(msg.data != "ACK" && msg.data != "START") {
				try {
					var obj = eval(msg.data);
					if(typeof obj != "undefined") {
						ipd.log(obj);
					}
				} catch(err) {
					ipd.log({ error: err.message });
				}
			}
		}
	});
}
function stop() {
	dojox.cometd.unsubscribe("/mobile");
}

var ipd = {
	log: function(msg) {
		try {
			var data = msg;
			if(typeof msg.nodeType != "undefined") {
				// It's an element. We have to serialize it
				data = serialize(msg);
			}
			dojox.cometd.publish("/desktop", { userAgent: window.navigator.userAgent, data:data });
		} catch(err) {
			if(typeof console != "undefined") {
				console.log("ipd.log(): ", err);
			} else {
				throw err;
			}
		}
	}
}

dojo.addOnLoad(start);
