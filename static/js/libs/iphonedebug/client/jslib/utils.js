function serialize(obj) {
	var json = "";
	if (typeof obj == "object" && obj.length) {
		// It's an indexed array
		json += "[";
		for (i in obj) {
			json += serialize(obj[i]);
		}
		json += "]";
		return json;
	} else if (typeof obj == "object") {
		// It's an object
		json += "{";
		for (key in obj) {
			var val = obj[key];
			var type = typeof val;
			json += (json.length > 1 ? "," : "") + key + ":" + "\""
					+ escape(val) + "\"";
		}
		json += "}";
		return json;
	} else if (typeof obj == "number") {
		return obj;
	} else {
		var json = (obj ? obj.replace("\"", "\\\"") : "null");
		return "\"" + escape(obj) + "\"";
	}
}