var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.add_link = function(options) {
    tc.util.log('project.add_link');
    var dom = options.dom,
        elements = {
            window: tc.jQ(window)
        },
        components = {
            merlin:null
        };
    
    var build_merlin = function(){
        if(components.merlin){
            return;
        }
        components.merlin = new tc.merlin(options.app,{
            name:'add-link',
            dom:dom.find('.merlin.add-link'),
            next_button:dom.find('a.submit'),
            first_step:'link-info',
            use_hashchange:false,
            data:{
                project_id:null,
                title:null,
                url:null,
                main_text:''
            },
            steps:{
                'link-info':{
                    selector:'.step.add-link-step',
                    next_step:'link-submit',
                    inputs:{
                        title:{
                            selector:'input.link-title',
                            validators:['min-3','max-50','required'],
                            hint:'Title',
                            counter:{
                                selector:'.charlimit.title',
                                limit:50
                            }
                        },
                        url:{
                            selector:'input.link-href',
                            validators:['min-3','max-300','required','url'],
                            hint:'URL'
                        },
                        main_text:{
                            selector:'input.main_text',
                            validators:['max-0']
                        }
                    },
                    init:function(merlin,dom){
                        merlin.current_step.inputs.title.dom.removeClass('has-been-focused').removeClass('has-attempted-submit').val('').triggerHandler('keyup');
                        merlin.current_step.inputs.url.dom.removeClass('has-been-focused').removeClass('has-attempted-submit').val('').triggerHandler('keyup');
                        
                        merlin.current_step.inputs.title.dom.val('Title');
                        merlin.current_step.inputs.url.dom.val('URL');
                        
                    },
                    finish:function(merlin,dom){
                        merlin.options.data = tc.jQ.extend(merlin.options.data,{
                            project_id:merlin.app.app_page.data.project.project_id,
                            title:merlin.current_step.inputs.title.dom.val(),
                            url:merlin.current_step.inputs.url.dom.val(),
                            main_text:merlin.current_step.inputs.main_text.dom.val()
                        });
                    }
                },
                'link-submit':{
                    selector:'.step.submit-link-step',
                    init:function(merlin,dom){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/link/add',
                            data:merlin.options.data,
                            context:merlin,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    return false;
                                }
                                project.dom.trigger('resources-refresh',{type:'link'});
                                window.location.hash = 'project-home';
                            }
                        });
                    }
                }
            }
        });
    };
    
    build_merlin();

    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& add_link showing ' + options.name);
            dom.show();

            if(components.merlin){
                components.merlin.show_step('link-info');
            }

            if((dom.offset().top - elements.window.scrollTop()) < 0){
                elements.window.scrollTop(0);
            }
        } else {
            tc.util.log('&&& add_link hiding ' + options.name);
            dom.hide();
        }
    });
};