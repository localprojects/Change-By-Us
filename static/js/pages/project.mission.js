var tc = tc || {};
tc.gam = tc.gam || {};
tc.gam.project_widgets = tc.gam.project_widgets || {};

tc.gam.project_widgets.infopane = function(options){
    tc.util.log("project.infopane");
    var dom = options.dom,
        is_editable = false,
        self = {};
        
    if(options.project_user.is_project_admin || (options.user && options.user.is_admin)){
        is_editable = true;
    }
    
    var elements = {
        mission: {
            init: function(element) {
                if (is_editable) {
                    element.addClass("mod-inline-edit");
                    new tc.inlineEditor({
                        dom: element,
                        service: {
                            url: "/project/description",
                            param: "text",
                            post_data: {
                                project_id: options.project_data.project_id
                            }
                        },
                        charlimit: 200
                    });
                }
            }
        },
        endorsements: {
            
        },
        location_map: {
            map: null,
            init: function() {
                var coords, zoom, map;
                tc.util.log("project.infopane.location_map.init");
                
                coords = [options.project_data.info.location.position.lat, 
                          options.project_data.info.location.position.lng];
                zoom = 12;
                
                if(coords[0] == 'None' || coords[1] == 'None'){
                    coords = [40.716667, -74];
                    zoom = 9;
                }
                
                map = new google.maps.Map(document.getElementById("location-map"), {
                    center: new google.maps.LatLng(coords[0], coords[1]),
                    zoom: zoom,
                    maxZoom: zoom,
                    minZoom: zoom,
                    disableDefaultUI: true,
                    mapTypeControlOptions: {
                       mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'GAM']
                    },
                    draggable: false
                });
                
                map.mapTypes.set("GAM", new google.maps.StyledMapType(gamMapStyle, { name: "Give a Minute" }));
                map.setMapTypeId("GAM");
                
                elements.location_map.map = map;
            }
        },
        keywords: {
            add_keyword_btn: null,
            edit_controls: null,
            init: function(element) {
                elements.keywords.add_keyword_btn = element.find(".add-keyword");
                if (elements.keywords.add_keyword_btn.length) {
                    elements.keywords.edit_controls = element.find(".inline-edit-controls");
                    elements.keywords.add_keyword_btn.bind(
                        "click", 
                        handlers.add_keyword_clicked
                    );
                }
            },
            add_keywords: function() {
                elements.keywords.add_keyword_btn.hide();
                elements.keywords.edit_controls.find("input[type=text]").val("");
                elements.keywords.edit_controls.show().find(".add-btn").unbind('click').bind(
                    "click", 
                    handlers.add_keywords_submit
                );
            }
        }
    };
    
    var handlers = {
        add_keyword_clicked: function(e, d) {
            e.preventDefault();
            elements.keywords.add_keywords();
        },
        add_keywords_submit: function(e, d) {
            var input, text;
            e.preventDefault();
            
            input = elements.keywords.edit_controls.find("input[type=text]");
            text = input.val();
            if (text) {
                tc.jQ.ajax({
                    url: "/project/tag/add",
                    data: {
                        project_id: options.project_data.project_id,
                        text: text
                    },
                    type: "POST",
                    dataType: "text",
                    success: function(data, ts, xhr) {
                        var i, tags, temptag;
                        if (data == "False") {
                            return;
                        }
                        tags = dom.find("ul.tag-cloud");
                        text = text.split(",");
                        for (i in text) {
                            temptag = tc.jQ("<li class='admin' id='keyword-"+ text[i] +"'>"+
                                "<a href='/search?terms="+ text[i] +"'>"+ text[i] + "</a>"+
                                "<a class='remove-btn keyword' href='#remove,"+ text[i] +"'>"+
                                    "<span>Remove</span></a>"+
                            "</li>");
                            temptag.find('a.remove-btn.keyword').bind('click', handlers.remove_keyword);
                            tags.append(temptag);
                        }
                    }
                });
            }
            
            elements.keywords.edit_controls.hide();
            elements.keywords.add_keyword_btn.show();
        },
        remove_keyword:function(e){
            var t;
            e.preventDefault();
            e.stopPropagation();
            t = e.target;
            if(t.nodeName == 'SPAN'){
                t = t.parentNode;
            }
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-keyword'),
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/project/tag/remove',
                        data:{
                            project_id: options.project_data.project_id,
                            text: t.href.split(',')[1]
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
                            if(data == 'False'){
                                return false;
                            }
                            dom.find('#keyword-'+t.href.split(',')[1]).remove();
                        }
                    });
                }
            });
        },
        endorse_project:function(e){
            e.preventDefault();
            
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.endorse-project'),
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/project/endorse',
                        data:{
                            project_id: options.project_data.project_id,
                            user_id: options.user.u_id
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
                            if(data == 'False'){
                                return false;
                            }
                            location.reload(true);
                        }
                    });
                }
            });
        },
        remove_endorse:function(e){
            e.preventDefault();
            
            var t;
            t = e.target;
            if(t.nodeName == 'SPAN'){
                t = t.parentNode;
            }
            
            options.app.components.modal.show({
                app:options.app,
                source_element:tc.jQ('.modal-content.remove-endorse-project'),
                submit:function(){
                    tc.jQ.ajax({
                        type:'POST',
                        url:'/project/endorse/remove',
                        data:{
                            project_id: t.href.split(',')[1],
                            user_id: t.href.split(',')[2]
                        },
                        dataType:'text',
                        success:function(data,ts,xhr){
                            if(data == 'False'){
                                return false;
                            }
                            location.reload(true);
                        }
                    });
                }
            });
        }
    };

    dom.find('a.remove-btn.keyword').unbind('click').bind('click', handlers.remove_keyword);
    dom.find('a.endorse-button').unbind('click').bind('click', handlers.endorse_project);
    dom.find('a.remove-endorse').unbind('click').bind('click', handlers.remove_endorse);
    
    elements.mission.init( dom.find(".our-mission") );
    elements.location_map.init();
    elements.keywords.init( dom.find(".keywords") );
    
    return self;
};
