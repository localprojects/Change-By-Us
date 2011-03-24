if(typeof ipdConfig != 'undefined') { 
	var oldConfig = ipdConfig; 
}
var ipdConfig = {
	baseUrl: "",
	consoleBaseUrl: "http://localhost:8170/"
};
if(typeof oldConfig != 'undefined') {
	for(attr in oldConfig) { 
		ipdConfig[attr] = oldConfig[attr]; 
	} 
	oldConfig = null;
}

// load libraries
if(typeof dojo == 'undefined') {
  djConfig = {
    usePlainJson: true
  };
  document.write('<script src="' + ipdConfig.baseUrl + 'jslib/dojo/dojo.js"></script>');
}
document.write('<script src="' + ipdConfig.baseUrl + 'jslib/utils.js"></script>');
document.write('<script src="' + ipdConfig.baseUrl + '_ipd.js"></script>');