tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.resources = function(project, dom, deps, options){
    var me = this;
    tc.util.log("project.resources");
    this.options = tc.jQ.extend({name:'resources'},options);
    this.dom = dom;
        
    this.elements = {
        links_empty:this.dom.find('.links-empty'),
        links_not_empty:this.dom.find('.links-not-empty'),
        links_table:this.dom.find('.link-table'),
        organizations_empty:this.dom.find('.organizations-empty'),
        organizations_not_empty:this.dom.find('.organizations-not-empty'),
        organizations_table:this.dom.find('.organization-table')
    };
    
    this.components = {
        tooltips:null
    };
    
    this.runtime_data = {};
    
    this.handlers = {
        resource_refresh_handler:function(e,d){
            if(d.type){
                switch(d.type){
                    case 'link':
                        e.data.me.runtime_data.load_into = 'link';
                        //e.data.me.elements.links_table.children('tbody').children().remove();
                        //e.data.me.elements.links_table.children('tbody').append('<tr><td class="loading"><img class="loading" src="/static/images/loader32x32.gif" /></td></tr>');
                        break;
                    case 'organization':
                        e.data.me.runtime_data.load_into = 'organization';
                        //e.data.me.elements.organizations_table.children('tbody').children().remove();
                        //e.data.me.elements.organizations_table.children('tbody').append('<tr><td class="loading"><img class="loading" src="/static/images/loader32x32.gif" /></td></tr>');
                        break;
                }
                
                tc.jQ.ajax({
                    type: 'GET',
                    url: '/project/resources',
                    data: {
                        project_id: project.data.project_id
                    },
                    context: e.data.me,
                    dataType:'text',
                    success: function(data){
                        try {
                            d = tc.jQ.parseJSON(data);
                        } catch(err) {
                            tc.util.log('error loading /project/resources','error');
                            return;
                        }
                        tc.jQ(project).trigger('resources-loaded',d);
                        
                    }
                });
            }
        },
        resources_loaded_handler:function(e,d){
            var i, temptbody, temptd;
            temptbody = tc.jQ('<tbody></tbody>');
            switch(e.data.me.runtime_data.load_into){
                case 'link':
                    if(!d.links.length){
                        e.data.me.elements.links_not_empty.hide();
                        e.data.me.elements.links_empty.show();
                    } else {
                        e.data.me.elements.links_empty.hide();
                        e.data.me.elements.links_not_empty.show();
                    }
                    for(i in d.links){
                        if(temptbody.find('tr').length == 0 || temptbody.find('tr:last').children().length == 2){
                            temptbody.append('<tr></tr>');
                        }
                        temptd = tc.jQ('<td></td>').append(tc.jQ('.template-content.link-table-cell').clone().children());
                        if(d.links[i].image_id){
                            temptd.find('img').attr('src',media_root+'images/'+(d.links[i].image_id%10)+'/'+d.links[i].image_id+'.png');
                        }
                        temptd.find('a.close').attr('href','#removeLink,'+d.links[i].link_id);
                        temptd.find('.link-link').attr('href',d.links[i].url).children('span').text(d.links[i].title);
                        temptbody.find('tr:last').append(temptd);
                    }
                    e.data.me.elements.links_table.children('tbody').replaceWith(temptbody);
                    e.data.me.elements.links_table.find('a.close').unbind('click').bind('click', {project:project,me:e.data.me}, e.data.me.handlers.remove_resource);
                    break;
                case 'organization':
                    if(!d.resources.length){
                        e.data.me.elements.organizations_not_empty.hide();
                        e.data.me.elements.organizations_empty.show();
                    } else {
                        e.data.me.elements.organizations_empty.hide();
                        e.data.me.elements.organizations_not_empty.show();
                    }
                    for(i in d.resources){
                        if(temptbody.find('tr').length == 0 || temptbody.find('tr:last').children().length == 2){
                            temptbody.append('<tr></tr>');
                        }
                        temptd = tc.jQ('<td></td>').append(tc.jQ('.template-content.organization-table-cell').clone().children());
                        temptd.attr('title',d.resources[i].title);
                        if(d.resources[i].image_id){
                            temptd.find('img').attr('src',media_root+'images/'+(d.resources[i].image_id%10)+'/'+d.resources[i].image_id+'.png');
                        }
                        temptd.find('a.close').attr('href','#removeResource,'+d.resources[i].organization);
                        temptd.find('.tooltip_trigger')
                            .attr('rel','#organization,'+d.resources[i].organization)
                            .children('span')
                            .children('a')
                                .attr('href',d.resources[i].url).children('span').text(d.resources[i].title);
                        e.data.me.components.tooltips.add_trigger(temptd.find('.tooltip_trigger'));
                        temptbody.find('tr:last').append(temptd);
                    }
                    e.data.me.elements.organizations_table.children('tbody').replaceWith(temptbody);
                    e.data.me.elements.organizations_table.find('a.close').unbind('click').bind('click', {project:project,me:e.data.me}, e.data.me.handlers.remove_resource);
                    break;
                default:
                    return;
            }
            tc.addOfficialResourceTags(e.data.me.elements.organizations_table);
        },
        remove_resource:function(e){
            e.preventDefault();
            if(e.target.hash.split(',')[0] == '#removeLink'){
                e.data.project.options.app.components.modal.show({
                    app:e.data.project.options.app,
                    source_element:tc.jQ('.modal-content.remove-link'),
                    submit:function(){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/link/remove',
                            data:{
                                project_id: e.data.me.options.app.app_page.data.project.project_id,
                                link_id: e.target.href.split(',')[1]
                            },
                            context:e.data.me,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    return false;
                                }
                                tc.jQ(project).trigger('resources-refresh',{ type:'link' });
                            }
                        });
                    }
                });
            } else if(e.target.hash.split(',')[0] == '#removeOrganization'){
                e.data.project.options.app.components.modal.show({
                    app:e.data.project.options.app,
                    source_element:tc.jQ('.modal-content.remove-resource'),
                    submit:function(){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/resource/remove',
                            data:{
                                project_id: e.data.me.options.app.app_page.data.project.project_id,
                                project_resource_id: e.target.href.split(',')[1]
                            },
                            context:e.data.me,
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    return false;
                                }
                                tc.jQ(project).trigger('resources-refresh',{ type:'organization' });
                            }
                        });
                    }
                });
            }
        }
    };
    
    this.dom.find('a.close').unbind('click').bind('click', {project:project,me:this}, this.handlers.remove_resource);
    
    this.components.tooltips = tc.resource_tooltip({
        triggers: this.dom.find(".resources-list .tooltip_trigger"),
        trigger_class:'tooltip_trigger',
        markup_source_element:tc.jQ('#organization-markup-source'),
        get_url: "/project/resource/info"
    });
    
    tc.jQ(project).bind('resources-loaded', {me:this}, this.handlers.resources_loaded_handler);
    tc.jQ(project).bind('resources-refresh', {me:this}, this.handlers.resource_refresh_handler);

    /* TODO determine if this is even needed
    tc.jQ(tc).bind('show-project-widget', function(event, widgetName) {
        if (me.options.name === widgetName) {
            tc.util.log('&&& showing ' + me.options.name);
            me.dom.show();
        } else {
            tc.util.log('not hiding ' + me.options.name + ', that would be silly');
            //me.dom.hide();
        }
    });
    */
};