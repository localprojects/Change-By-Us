app_page.features.push(function(app){
			
			// Feature this project
			tc.jQ(".adminbar > .feature a").bind("click", {
					app: app,
					source_element: tc.jQ(".modal-content.feature-project-dialog"),
					init: function(modal, event_target, callback) {
						var modal_merlin;
						modal_merlin = new tc.merlin(app, {
							name: "feature_project",
							dom: modal.options.element.find(".feature-project-dialog"),
							next_button: modal.options.element.find(".actions .submit"),
							first_step: "feature-this-project",
							data: {
								project_id: app.app_page.data.project.project_id,
								replace_project_id: null
							},
							has_done_GET: false,
							already_featured_projects: null,
							max_featured_projects: 6,
							need_to_replace: false,
							use_hashchange:false,
							steps: {
								"feature-this-project": {
									selector: ".feature-this-project",
									next_step: "feature-this-project-submit",
									init: function(merlin, dom) {
										dom.find(".project-name").text(app.app_page.data.project.info.title);
										if (!merlin.options.has_done_GET) {
											tc.jQ.ajax({
												type:"GET",
												url:"/project/featured",
												context:merlin,
												dataType:"text",
												success: function(data, ts, xhr) {
													var d;
													try {
														d = tc.jQ.parseJSON(data);
													} catch(e) {
														tc.util.log("/project/featured: json parsing error", "warn");
														return;
													}
													
													this.options.already_featured_projects = d;
													if (d.length >= this.options.max_featured_projects) {
														this.options.need_to_replace = true;
														(function() {
															var select;
															select = dom.find(".replace-prompt select");
															tc.jQ.each(d, function(i, fp) {
																var option;
																option = tc.jQ("<option value='"+ fp.project_id +"'>"+
																	fp.title +"</option>");
																select.append(option);
															});
															/*select.jqDropDown({ 
																direction: 'down',
																placeholder: '.replace-project-options'
															});*/
														}());
													} else {
														dom.find(".replace-prompt").remove();
													}
												}
											});
											merlin.options.has_done_GET = true;
										}
									},
									finish: function(merlin, dom) {
										if (merlin.options.need_to_replace) {
											merlin.options.data.replace_project_id = 
												dom.find(".replace-prompt select option:selected").attr("value");
										} else {
											delete merlin.options.data.replace_project_id;
										}
									}
								},
								"feature-this-project-submit": {
									selector: ".feature-this-project-submit",
									init: function(merlin, dom) {
										tc.jQ.ajax({
											type:"POST",
											url:"/admin/project/feature",
											data: merlin.options.data,
											context:merlin,
											dataType:"text",
											success: function(data, ts, xhr) {
												if (data == "False") {
													//window.location.hash = "feature_project,feature-this-project-error";
													this.show_step('feature-this-project-error');
													return false;
												}
												tc.jQ(event_target).html("Featured Project!").parent().addClass("state-disabled");
												tc.timer(1000, function() {
													modal.hide();
												});
											}
										});
									}
								},
								"feature-this-project-error": {
									selector: ".feature-this-project-error",
									init: function(merlin, dom) {
										tc.timer(1000, function() {
											modal.hide();
										});
									}
								}
							}
						});
						if (tc.jQ.isFunction(callback)) {
							callback(modal);
						}
					}
				},
				function(e,d){
					var t;
					e.preventDefault();
					t = e.target;
					if (t.nodeName == 'SPAN'){
						t = t.parentNode;
					}
					if (tc.jQ(t.parentNode).hasClass("state-disabled")) {
						return;
					}
					e.data.app.components.modal.show(e.data, t);
				}
			);
			
			// Delete project
			tc.jQ('a.delete-project').bind('click',{app:app},function(e,d){
				var t;
				e.preventDefault();
				t = e.target;
				if(t.nodeName == 'SPAN'){
					t = t.parentNode;
				}
				e.data.app.components.modal.show({
					app:app,
					source_element:tc.jQ('.modal-content.project-delete'),
					submit:function(modal,callback){
						tc.jQ.ajax({
							type:'POST',
							url:'/admin/project/delete',
							data:{
								project_id:t.hash.split(',')[1]
							},
							context:app,
							dataType:'text',
							success:function(data,ts,xhr){
								if(this.app_page.data.redir_from){
									window.location = this.app_page.data.redir_from;
								} else {
									window.location = '/';
								}
							}
						});
					}
				});
			});
		
	});