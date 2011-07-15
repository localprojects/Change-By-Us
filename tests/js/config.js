// Add any files here that need to be loaded before all tests are run, (e.g. third-party libraries, like jQuery)
// NOTE: Load order does matter.

// This is your main JavaScript directory in your project.
EnvJasmine.jsDir = EnvJasmine.rootDir + "/../../../static/js/";

// Where the js unit tests live - remember the stuff in here needs a .spec.js suffix
EnvJasmine.specsDir = EnvJasmine.rootDir + "/../unittests/";

// For some sad reason, this does not work with 1.5.1. Will use 1.4.4 for now.
EnvJasmine.load(EnvJasmine.includeDir + "jquery-1.4.4.js");
//EnvJasmine.load(EnvJasmine.jsDir + "libs/jquery-1.5.1.min.js");
