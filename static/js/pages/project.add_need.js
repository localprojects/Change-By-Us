var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.add_need = function(options) {
  tc.util.log('project.add_need');
  var dom = options.dom,
      self = {};

  tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
    if (options.name === widgetName) {
      tc.util.log('&&& showing ' + options.name);
      tc.showProjectWidget(dom);
    } else {
      tc.util.log('&&& hiding ' + options.name);
      dom.hide();
    }
  });
  
  return self;
};