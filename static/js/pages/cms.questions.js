/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/


app_page.features.push(function(app){
	tc.util.log('Give A Minute: Admin Settings');
	

	app.components.cms_admin_merlin = new tc.merlin(app,{
		name:'cms-questions',
		dom:tc.jQ('.merlin-questions'),
		first_step:'questions',
		steps:{
			'questions':{
				selector:'#questions',
				components:{
					pagination:null
				},
				fn:{
					questions_input_change:function(e){
						var t;
						t = tc.jQ(e.target);
						tc.util.dump(t.attr('checked'));
						if(t.attr('rel')){
							switch(t.attr('rel').split(',')[0]){
								case 'setRole':
									tc.jQ.ajax({
										type:'POST',
										url:'/questions/user/setrole',
										data:{
											user_id:t.attr('rel').split(',')[2],
											role:t.attr('rel').split(',')[1]
										},
										context:e.data.me,
										dataType:'text',
										success:function(data,ts,xhr){
											if(data == 'False' || data == 'None'){
												return;
											}
										}
									});
									break;
								case 'setOncall':
									tc.jQ.ajax({
										type:'POST',
										url:'/questions/user/oncall',
										data:{
											user_id:t.attr('rel').split(',')[1],
											is_oncall:t.attr('checked') ? 1 : 0
										},
										context:e.data.me,
										dataType:'text',
										success:function(data,ts,xhr){
											if(data == 'False' || data == 'None'){
												return;
											}
										}
									});
									break;
							}
						}
					},
					delete_questions:function(e){
						tc.util.dump(e);
						e.preventDefault();
						tc.util.dump(e.target.href.split(',')[1]);
						e.data.me.app.components.modal.show({
							app:e.data.app,
							source_element:tc.jQ('.modal-content.remove-question'),
							submit:function(){
								tc.jQ.ajax({
									type:'POST',
									url:'/cms/questions/delete',
									data:{
										question_id: e.target.href.split(',')[1]
									},
									context:e.data.me,
									dataType:'text',
									success:function(data,ts,xhr){
										if(data == 'False'){
											return false;
										}
										window.location.reload(true);
									}
								});
							}
						});
					},
                    feature_questions:function(e){
						tc.util.dump(e);
						e.preventDefault();
						tc.util.dump(e.target.href.split(',')[1]);
						e.data.me.app.components.modal.show({
							app:e.data.app,
							source_element:tc.jQ('.modal-content.feature-question'),
							submit:function(){
								tc.jQ.ajax({
									type:'POST',
									url:'/cms/questions/feature',
									data:{
										question_id: e.target.href.split(',')[1]
									},
									context:e.data.me,
									dataType:'text',
									success:function(data,ts,xhr){
										if(data == 'False'){
											return false;
										}
                                        window.location.reload(true);
									}
								});
							}
						});
					}
				},
				runtime_data:{
					n_messages:null,
					offset:null,
					tr_element:tc.jQ('<tr>\
						<th scope="row" class="active-questions-info serif">\
							<h3 class="name"></h3>\
							<div class="email">\
								<a href="mailto:" class="email-a"></a>\
							</div>\
						</th>\
						<td class="control-questions-type">\
							<form>\
								<div>\
									<input class="radio-leader" type="radio" id="user-role-XX-radio-leader" name="user-role-xx-radio" />\
									<label for="user-role-xx-radio-leader" class="small">City Leader</label>\
								</div>\
								<div>\
									<input class="radio-moderator" type="radio" id="user-role--radio-moderator" name="user-role--radio" />\
									<label for="user-role-xx-radio-moderator" class="small">Moderator</label>\
								</div>\
								<div>\
									<input class="radio-questions" type="radio" id="user-role-xx-radio-questions" name="user-role-xx-radio" />\
									<label for="user-role-xx-radio-questions" class="small">Super questions</label>\
								</div>\
							</form>\
						</td>\
						<td class="control-call-status">\
							<input class="checkbox-oncall" type="checkbox" id="user-oncall-x-check" name="user-oncall-xx-check" />\
							<label for="user-oncall-xx-check" class="white">On Call</label>\
						</td>\
						<td class="control-delete">\
							<a href="#" class="delete">Delete</a>\
						</td>\
					</tr>')
				},
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li').removeClass('active');
					tc.jQ('.headlands .tabs li.questions').addClass('active');
					
					if(app.components.add_questions_merlin){
						app.components.add_questions_merlin.show_step('main');
					}
					
					if(!merlin.current_step.components.pagination){
						merlin.current_step.components.pagination = true;
						
						merlin.current_step.components.questions_pagination = new tc.carousel({
							element: this.dom.find(".questions.carousel"),
							next_button: dom.find('.questions-carousel-next'),
							prev_button: dom.findquestions
						});
						
						merlin.current_step.runtime_data.n_to_fetch = 10;
						merlin.current_step.runtime_data.offset = merlin.current_step.components.questions_pagination.carousel.getItems().first().find('tr').length;
						
						dom.find('input').bind('change', {me:merlin, dom:dom}, merlin.current_step.fn.questions_input_change);
						dom.find('a.delete').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.delete_questions);
						dom.find('a.feature').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.feature_questions);
						
						merlin.current_step.components.questions_pagination.carousel.getRoot().bind('onSeek', {me:merlin,dom:dom}, function(e,d){
							e.data.me.current_step.runtime_data.current_page = e.data.me.current_step.components.questions_pagination.carousel.getItems().eq(e.data.me.current_step.components.questions_pagination.carousel.getIndex());
							if(!e.data.me.current_step.runtime_data.current_page.hasClass('loaded')){
								e.data.me.current_step.runtime_data.current_page.addClass('loaded');
								tc.jQ.ajax({
									type:"GET",
									url:"/questions/users",
									data:{
										n_messages: merlin.current_step.runtime_data.n_to_fetch,
										offset: merlin.current_step.runtime_data.offset
									},
									context:e.data.me,
									dataType:"text",
									success: function(data, ts, xhr) {
										var d, temptbody, temprow;
										try {
											d = tc.jQ.parseJSON(data);
										} catch(e) {
											tc.util.log("/questions/users: json parsing error", "warn");
											return;
										}
										if(!d.length){
											this.current_step.runtime_data.current_page.remove();
											return;
										}
										if(d.length == this.current_step.runtime_data.n_to_fetch){
											this.current_step.components.questions_pagination.carousel.addItem('<li>\
												<table class="active-questions-table">\
													<tbody>\
														<tr>\
															<td class="spinner-message clearfix">\
																<p class="west">Loading...</p>\
															</td>\
														</tr>\
													</tbody>\
												</table>\
											</li>');
										}
										temptbody = tc.jQ('<tbody></tbody>');
										for(i in d){
											temprow = this.current_step.runtime_data.tr_element.clone();
											temprow.attr('id','user-'+d[i].user_id);
											temprow.find('h3.name').html("<a href='/useraccount/"+ d[i].user_id +"'>" + d[i].first_name+' '+d[i].last_name + "</a>");
											temprow.find('a.email-a').attr('href','mailto:'+d[i].email).text(d[i].email);
											temprow.find('input.radio-leader').attr('id','user-role-'+d[i].user_id+'-radio-leader').attr('name','user-role-'+d[i].user_id+'-radio').attr('rel','setRole,'+3+','+d[i].user_id).siblings('label').attr('for','user-role-'+d[i].user_id+'-radio-leader');
											temprow.find('input.radio-moderator').attr('id','user-role-'+d[i].user_id+'-radio-moderator').attr('name','user-role-'+d[i].user_id+'-radio').attr('rel','setRole,'+2+','+d[i].user_id).siblings('label').attr('for','user-role-'+d[i].user_id+'-radio-moderator');
											temprow.find('input.radio-questions').attr('id','user-role-'+d[i].user_id+'-radio-questions').attr('name','user-role-'+d[i].user_id+'-radio').attr('rel','setRole,'+1+','+d[i].user_id).siblings('label').attr('for','user-role-'+d[i].user_id+'-radio-questions');
											temprow.find('input.checkbox-oncall').attr('id','user-oncall-'+d[i].user_id+'-check').attr('name','user-oncall-'+d[i].user_id+'-check').attr('rel','setOncall,'+d[i].user_id).siblings('label').attr('for','user-oncall-'+d[i].user_id+'-check');
											
											if(d[i].is_leader){
												temprow.find('input.radio-leader').attr('checked',true).get(0).defaultChecked = true;
											}
											if(d[i].is_moderator){
												temprow.find('input.radio-moderator').attr('checked',true).get(0).defaultChecked = true;
											}
											if(d[i].is_questions){
												temprow.find('input.radio-questions').attr('checked',true).get(0).defaultChecked = true;
											}
											if(d[i].is_oncall){
												temprow.find('input.checkbox-oncall').attr('checked',true).get(0).defaultChecked = true;
											}
											
											
											temprow.find('a.delete').attr('href','#delete,'+d[i].user_id);
											temptbody.append(temprow);
											this.current_step.runtime_data.offset++;
										}
										temptbody.find('input').bind('change', {me:this}, this.current_step.fn.questions_input_change);
										tc.util.dump(temptbody.find('a.delete'));
										temptbody.find('a.delete').bind('click', {me:this}, this.current_step.fn.delete_questions);
										this.current_step.runtime_data.current_page.find('tbody').replaceWith(temptbody);
										dom.find('input[type=checkbox],input[type=radio]').not('.has-prettycheckbox').prettyCheckboxes();
									}
								});
							}
						});
						
					}
					
				}
			},
			'blacklists':{
				selector:'#blacklist',
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li').removeClass('active');
					tc.jQ('.headlands .tabs li.blacklist').addClass('active');
					
					if(app.components.blacklist_merlin){
						app.components.blacklist_merlin.show_step('main');
					}
				}
			}
		}
	});
	

	app.components.add_questions_merlin = new tc.merlin(app,{
		name:'add-questions',
		dom:tc.jQ('.add-questions-merlin'),
		next_button:tc.jQ('a.questions-merlin-next-step'),
		first_step:'main',
		data:{
			question:null
		},
		use_hashchange:false,
		steps:{
			'main':{
				selector:'.add-questions-main',
				next_step:'finish',
				inputs:{
					question:{
						selector:'input.question',
						validators: function(merlin,dom,current_step){
                            if(current_step.inputs.question.dom.val().length){
								return tc.validate(dom,['min-3','max-64']);
							} else {
								return tc.validate(dom,['min-3','max-64','required']);
							}
						},
						validators_old:['min-3','max-64','required']
					}
				},
				init:function(merlin,dom){
					
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						question:merlin.current_step.inputs.question.dom.val()
					});
				}
			},
			'error':{
				selector:'.add-questions-error'
			},
			'finish':{
				selector:'.add-questions-finish',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/questions/add',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								this.show_step('error');
								return;
							}
							window.location.reload(true);
						}
					});
				}
			}
		}
	});
	
/*
    app.components.feature_questions_merlin = new tc.merlin(app,{
		name:'add-questions',
		dom:tc.jQ('.add-questions-merlin'),
		next_button:tc.jQ('a.questions-merlin-next-step'),
		first_step:'main',
		data:{
			question_id:null
		},
		use_hashchange:false,
		steps:{
			'main':{
				selector:'.add-questions-main',
				next_step:'finish',
				inputs:{
					question:{
						selector:'input.question',
						validators: function(merlin,dom,current_step){
                            if(current_step.inputs.question.dom.val().length){
								return tc.validate(dom,['min-3','max-64']);
							} else {
								return tc.validate(dom,['min-3','max-64','required']);
							}
						},
						validators_old:['min-3','max-64','required']
					}
				},
				init:function(merlin,dom){
					
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						question:merlin.current_step.inputs.question.dom.val()
					});
				}
			},
			'error':{
				selector:'.add-questions-error'
			},
			'finish':{
				selector:'.add-questions-finish',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/questions/add',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								this.show_step('error');
								return;
							}
							window.location.reload(true);
						}
					});
				}
			}
		}
	});
*/
	// question
	new tc.inlineEditor({
		dom: tc.jQ("#q-1 .question-text"),
		service: {
			url: "/cms/questions/edit",
			param: "question-text"
		},
		empty_text: "Click here to change this question."
	});

		
	tc.jQ('.adminbar li.homepage-questions').addClass('active');
	
});
