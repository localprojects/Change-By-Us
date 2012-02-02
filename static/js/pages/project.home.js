/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.home = function(options) {
    tc.util.log('project.home');
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
    
    var handlers = {
    	remove_comment:function(e){
            e.preventDefault();
            
            var message_id = tc.jQ(this).attr('data-message_id');
            
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-message'),
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/project/message/remove',
                        data:{
                            message_id: message_id
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
//                            var n_messages;
                            if(data == 'False'){
                                return false;
                            }
                            
                            //$('#message-'+message_id).remove();
                            tc.jQ('li.message-'+message_id).remove();
//                            n_messages = dom.find('.comment-stack').children().length;
//                            dom.find('.comment-counter').text(n_messages);
                        }
                    });
                }
            });
        }
    }
    
    dom.find('a.close').unbind('click').bind('click', handlers.remove_comment);
    
    return self;
};