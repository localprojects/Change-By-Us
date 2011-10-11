var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.inkind_form = function(options) {
  tc.util.log('project.inkind_form');
  var dom = options.dom,
      $window = tc.jQ(window),
      self = {};

  tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
    if (options.name === widgetName) {
      tc.util.log('&&& showing ' + options.name);
      dom.show();

      if((dom.offset().top - $window.scrollTop()) < 0){
        $window.scrollTop(0);
      }
    } else {
      tc.util.log('&&& hiding ' + options.name);
      dom.hide();
    }
  });
  
  return self;
};