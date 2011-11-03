var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.fresh_ideas = function(options){
    tc.util.log("project.fresh_ideas");
    var dom = options.dom,
        carouselWidget = new tc.carousel({
            element: dom.find(".carousel"),
            pagination: {
                current: dom.find(".pagination .cur-index"),
                total: dom.find(".pagination .total, .hd h2 .counter")
            }
        });

    dom.find('a.flag-idea').bind('click', function(e){
        e.preventDefault();
        tc.jQ.ajax({
            type:"POST",
            url:'/idea/flag',
            data:{
                idea_id:e.target.hash.split(',')[1]
            },
            dataType:"text",
            success: function(data, ts, xhr) {
                if (data == "False") {
                    return false;
                }
                tc.jQ(e.target).parent().text('Flagged');
            }
        });
    });
    
    dom.find('a.remove-idea').bind('click', function(e){
        e.preventDefault();
        
        options.app.components.modal.show({
            app:options.app,
            source_element:tc.jQ('.modal-content.remove-idea'),
            submit:function(){
                var id;
                id = e.target.hash.split(",")[1];
                tc.jQ.ajax({
                    type:'POST',
                    url:'/idea/remove',
                    data:{
                        idea_id: id
                    },
                    context: tc.jQ(e.target),
                    dataType:'text',
                    success:function(data,ts,xhr){
                        if(data == 'False'){
                            return false;
                        }
                        tc.jQ(tc).trigger("project-idea-remove", { id: id });
                    }
                });
            }
        });
    });
    
    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& showing ' + options.name);
            tc.showProjectWidget(dom);
        } else {
            tc.util.log('&&& hiding ' + options.name);
            dom.hide();
        }
    });
    
    tc.jQ(tc).bind('project-idea-remove', function(event, id) {
        if (carouselWidget.carousel) {
            carouselWidget.carousel.getRoot().find("li[rel='idea-"+ id +"']").remove();
            carouselWidget.update_pagination().update_navigation();
        }
    });
};