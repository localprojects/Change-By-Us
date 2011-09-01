var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.resources = function(options){
    tc.util.log("project.resources");
    
    var dom = options.dom,
        runtime_data = {},
        elements = {
            links_empty:dom.find('.links-empty'),
            links_not_empty:dom.find('.links-not-empty'),
            links_table:dom.find('.link-table'),
            organizations_empty:dom.find('.organizations-empty'),
            organizations_not_empty:dom.find('.organizations-not-empty'),
            organizations_table:dom.find('.organization-table')
        },
        components = {
            tooltips:null
        },
        self = {};
        
    var handlers = {
        resource_refresh_handler:function(e,d){
            if(d.type){
                switch(d.type){
                    case 'link':
                        runtime_data.load_into = 'link';
                        //elements.links_table.children('tbody').children().remove();
                        //elements.links_table.children('tbody').append('<tr><td class="loading"><img class="loading" src="/static/images/loader32x32.gif" /></td></tr>');
                        break;
                    case 'organization':
                        runtime_data.load_into = 'organization';
                        //elements.organizations_table.children('tbody').children().remove();
                        //elements.organizations_table.children('tbody').append('<tr><td class="loading"><img class="loading" src="/static/images/loader32x32.gif" /></td></tr>');
                        break;
                }
                
                tc.jQ.ajax({
                    type: 'GET',
                    url: '/project/resources',
                    data: {
                        project_id: options.project_data.project_id
                    },
                    dataType:'text',
                    success: function(data){
                        try {
                            d = tc.jQ.parseJSON(data);
                        } catch(err) {
                            tc.util.log('error loading /project/resources','error');
                            return;
                        }
                        tc.jQ(tc).trigger('resources-loaded',d);
                        
                    }
                });
            }
        },
        resources_loaded_handler:function(e,d){
            var i, temptbody, temptd;
            temptbody = tc.jQ('<tbody></tbody>');
            switch(runtime_data.load_into){
                case 'link':
                    if(!d.links.length){
                        elements.links_not_empty.hide();
                        elements.links_empty.show();
                    } else {
                        elements.links_empty.hide();
                        elements.links_not_empty.show();
                    }
                    for(i in d.links){
                        if(temptbody.find('tr').length == 0 || temptbody.find('tr:last').children().length == 2){
                            temptbody.append('<tr></tr>');
                        }
                        temptd = tc.jQ('<td></td>').append(tc.jQ('.template-content.link-table-cell').clone().children());
                        if(d.links[i].image_id){
                            temptd.find('img').attr('src',options.media_root+'images/'+(d.links[i].image_id%10)+'/'+d.links[i].image_id+'.png');
                        }
                        temptd.find('a.close').attr('href','#removeLink,'+d.links[i].link_id);
                        temptd.find('.link-link').attr('href',d.links[i].url).children('span').text(d.links[i].title);
                        temptbody.find('tr:last').append(temptd);
                    }
                    elements.links_table.children('tbody').replaceWith(temptbody);
                    elements.links_table.find('a.close').unbind('click').bind('click', handlers.remove_resource);
                    break;
                case 'organization':
                    if(!d.resources.length){
                        elements.organizations_not_empty.hide();
                        elements.organizations_empty.show();
                    } else {
                        elements.organizations_empty.hide();
                        elements.organizations_not_empty.show();
                    }
                    for(i in d.resources){
                        if(temptbody.find('tr').length == 0 || temptbody.find('tr:last').children().length == 2){
                            temptbody.append('<tr></tr>');
                        }
                        temptd = tc.jQ('<td></td>').append(tc.jQ('.template-content.organization-table-cell').clone().children());
                        temptd.attr('title',d.resources[i].title);
                        if(d.resources[i].image_id){
                            temptd.find('img').attr('src',options.media_root+'images/'+(d.resources[i].image_id%10)+'/'+d.resources[i].image_id+'.png');
                        }
                        temptd.find('a.close').attr('href','#removeResource,'+d.resources[i].organization);
                        temptd.find('.tooltip_trigger')
                            .attr('rel','#organization,'+d.resources[i].organization)
                            .children('span')
                            .children('a')
                                .attr('href',d.resources[i].url).children('span').text(d.resources[i].title);
                        components.tooltips.add_trigger(temptd.find('.tooltip_trigger'));
                        temptbody.find('tr:last').append(temptd);
                    }
                    elements.organizations_table.children('tbody').replaceWith(temptbody);
                    elements.organizations_table.find('a.close').unbind('click').bind('click', handlers.remove_resource);
                    break;
                default:
                    return;
            }
            tc.addOfficialResourceTags(elements.organizations_table);
        },
        remove_resource:function(e){
            e.preventDefault();
            if(e.target.hash.split(',')[0] == '#removeLink'){
                options.app.components.modal.show({
                    app:options.app,
                    source_element:tc.jQ('.modal-content.remove-link'),
                    submit:function(){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/link/remove',
                            data:{
                                project_id: options.project_data.project_id,
                                link_id: e.target.href.split(',')[1]
                            },
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    return false;
                                }
                                tc.jQ(tc).trigger('resources-refresh',{ type:'link' });
                            }
                        });
                    }
                });
            } else if(e.target.hash.split(',')[0] == '#removeOrganization'){
                options.app.components.modal.show({
                    app:options.app,
                    source_element:tc.jQ('.modal-content.remove-resource'),
                    submit:function(){
                        tc.jQ.ajax({
                            type:'POST',
                            url:'/project/resource/remove',
                            data:{
                                project_id: options.project_data.project_id,
                                project_resource_id: e.target.href.split(',')[1]
                            },
                            dataType:'text',
                            success:function(data,ts,xhr){
                                if(data == 'False'){
                                    return false;
                                }
                                tc.jQ(tc).trigger('resources-refresh',{ type:'organization' });
                            }
                        });
                    }
                });
            }
        }
    };
    
    dom.find('a.close').unbind('click').bind('click', handlers.remove_resource);
    
    components.tooltips = tc.resource_tooltip({
        triggers: dom.find(".resources-list .tooltip_trigger"),
        trigger_class:'tooltip_trigger',
        markup_source_element:tc.jQ('#organization-markup-source'),
        get_url: "/project/resource/info"
    });
    
    tc.jQ(tc).bind('resources-loaded', handlers.resources_loaded_handler);
    tc.jQ(tc).bind('resources-refresh', handlers.resource_refresh_handler);
    
    return self;
};