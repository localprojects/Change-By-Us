var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.related_resources = function(options){
    tc.util.log("project.related_resources");
    var dom = options.dom,
        elements = {
            resource_counter: dom.find(".counter"),
            resources_table: dom.find("table.resources-list"),
            empty_box: dom.find(".empty-state-box")
        },
        self = {};
        
    var handlers = {
        resources_loaded: function(data, ts, xhr) {
            var d;
            try {
                d = tc.jQ.parseJSON(data);
            } catch(err) {
                no_resources();
                return;
            }
            if (d.resources.length) {
                populate(d);
            } else {
                no_resources();
            }
        },
        add_resource_click: function(e, d) {
            var add_btn, my_id;
            e.preventDefault();
            
            add_btn = tc.jQ(e.target);
            my_id = add_btn.attr("href").split(",")[1];
            
            tc.jQ.ajax({
                url: "/project/resource/add",
                type: "POST",
                dataType: "text",
                data: {
                    project_id: options.project_data.project_id,
                    project_resource_id: my_id
                },
                success: function(data, ts, xhr) {
                    if(data == 'False'){
                        tc.util.log("resource add failed");
                        return false;
                    }
                    tc.util.log("resource add success");
                    project.dom.trigger('resources-refresh',{ type:'organization' });
                    add_btn.parent().addClass("added");
                }
            });
        }
    };
    
    function getRelatedResources() {
        tc.jQ.ajax({
            type: 'GET',
            url: '/project/resources/related',
            data: {
                project_id: options.project_data.project_id
            },
            dataType:'text',
            success: handlers.resources_loaded
        });
    }
    
    function populate(d) {
        var tbody;
        
        tbody = "<tbody>";
        tc.jQ.each(d.resources, function(i, resource) {
            var temp, even;
            
            temp = "";
            even = (i % 2 === 0);
            
            if (even) { temp = "<tr>"; }
            temp += "<td class='" + (resource.is_official ? "official-resource" : "") + "'>";
            
            temp += '<a href="#add,'+ resource.link_id +'" class="add-button rounded-button small">Add</a>';

            if (resource.image_id > 0) {
                temp += '<span class="thumb">';
                if (options.user && options.user.is_admin) {
                    temp += '<a class="close" href="#removeOrganization,'+resource.project_resource_id+'"><span>Close</span></a>';
                }
                temp += '<img src="'+media_root+'images/'+(resource.image_id % 10)+'/'+resource.image_id+'.png" width="30" height="30" alt="" /></span>';
            } else {            
                temp += '<span class="thumb">';
                if (options.user && options.user.is_admin) {
                    temp += '<a class="close" href="#removeOrganization,'+resource.project_resource_id+'"><span>Close</span></a>';
                }
                temp += '<img src="/static/images/thumb_genAvatar30.png" width="30" height="30" alt="" /></span>';
            };

            temp += '<span class="resource-name" ><span>'+
                        '<span class="organization-name tooltip_trigger" rel="#organization,'+ resource.link_id +'">'+ 
                            resource.title +
                        '</span></span></span>';
            
            // hidden added dialog
            temp += '<div class="added-dialog">'+
                        '<span class="added-header">Added <em>to</em> your project</span><br />'+
                        '<span class="added-text">We\'ve sent them a link to your project page.'+
                        ' </span></div>';
            
            temp += "</td>";
            if (!even) { temp += "</tr>"; }
            
            tbody += temp;
        });
        tbody += "</tbody>";
        tbody = tc.jQ(tbody);
        
        tbody.find("a.add-button").bind("click", handlers.add_resource_click);
        
        elements.resources_table.empty().append(tbody);
        elements.empty_box.hide();
        elements.resource_counter.text(d.resources.length);
        
        tc.resource_tooltip({
            triggers: elements.resources_table.find(".tooltip_trigger"),
            trigger_class:'tooltip_trigger',
            markup_source_element:tc.jQ('#organization-markup-source'),
            get_url: "/project/resource/info"
        });
        
        elements.resources_table.find('.close').unbind('click').bind('click', function(e){
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-resource'),
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/admin/resource/delete',
                        data:{
                            resource_id: e.target.href.split(',')[1]
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
                            if(data == 'False'){
                                return false;
                            }
                            tc.jQ(this.target).parent().parent().animate({
                                'opacity':0.0
                            },600,'easeOutCubic');
                        }
                    });
                }
            });
        });
        
        tc.addOfficialResourceTags(tc.jQ('.related-resources .resources-list'));
    }
    
    function no_resources() {
        elements.resources_table.hide();
        elements.empty_box.show();
        elements.resource_counter.text("0");
    }

    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (options.name === widgetName) {
            tc.util.log('&&& showing ' + options.name);
            tc.showProjectWidget(dom);
        } else {
            tc.util.log('&&& hiding ' + options.name);
            dom.hide();
        }
    });
    
    getRelatedResources();
    
    return self;
};
