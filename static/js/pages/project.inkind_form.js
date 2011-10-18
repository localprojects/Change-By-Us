var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.inkind_form = function(options) {
  tc.util.log('project.inkind_form');
  var dom = options.dom,
      $window = tc.jQ(window),
      self = {};

  var initForm = function(need_id, callback) {
    var project_id = options.app.app_page.data.project.project_id;

    dom.find('input[type=radio]').prettyCheckboxes();

    // tc.gam.project_data.getProjectEvents(project_id, function(events) {
    //   cached_events = events;
    // 
    //   if (need_id) {
    //   //We are editing an existing need
    //       tc.gam.project_data.getNeedDetails(need_id, function(data){
    //           mergeTemplate(data);
    //           if (callback) {
    //               callback();
    //           }
    //           initMerlin(need_id);
    //       });
    //   } else {
    //       mergeTemplate();
          if (callback) {
              callback();
          }
    //       initMerlin();
    //   }
    // });
  };
      
  tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
    if (options.name === widgetName) {
      tc.util.log('&&& showing ' + options.name);

      initForm(id, function(){
          dom.show();
      });

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