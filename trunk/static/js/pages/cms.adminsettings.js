
app_page.features.push(function(app){
	tc.util.log('Give A Minute: Admin Settings');
	
	app.components.cms_admin_merlin = new tc.merlin(app,{
		name:'cms-admin',
		dom:tc.jQ('.merlin-admin-settings'),
		first_step:'admins',
		steps:{
			'admins':{
				selector:'#administrators',
				components:{
					pagination:null
				},
				fn:{
					admin_input_change:function(e){
						var t;
						t = tc.jQ(e.target);
						tc.util.dump(t.attr('checked'));
						if(t.attr('rel')){
							switch(t.attr('rel').split(',')[0]){
								case 'setRole':
									tc.jQ.ajax({
										type:'POST',
										url:'/admin/user/setrole',
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
										url:'/admin/user/oncall',
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
					delete_admin:function(e){
						tc.util.dump(e);
						e.preventDefault();
						tc.util.dump(e.target.href.split(',')[1]);
						e.data.me.app.components.modal.show({
							app:e.data.app,
							source_element:tc.jQ('.modal-content.remove-user'),
							submit:function(){
								tc.jQ.ajax({
									type:'POST',
									url:'/admin/user/delete',
									data:{
										user_id: e.target.href.split(',')[1]
									},
									context:e.data.me,
									dataType:'text',
									success:function(data,ts,xhr){
										if(data == 'False'){
											return false;
										}
										this.dom.find('#user-'+e.target.href.split(',')[1]).slideUp();
										this.current_step.runtime_data.offset--;
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
						<th scope="row" class="active-admin-info serif">\
							<h3 class="name"></h3>\
							<div class="email">\
								<a href="mailto:" class="email-a"></a>\
							</div>\
						</th>\
						<td class="control-admin-type">\
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
									<input class="radio-admin" type="radio" id="user-role-xx-radio-admin" name="user-role-xx-radio" />\
									<label for="user-role-xx-radio-admin" class="small">Super Admin</label>\
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
					tc.jQ('.headlands .tabs li.administrators').addClass('active');
					
					if(app.components.add_admin_merlin){
						app.components.add_admin_merlin.show_step('main');
					}
					
					if(!merlin.current_step.components.pagination){
						merlin.current_step.components.pagination = true;
						
						merlin.current_step.components.admins_pagination = new tc.carousel({
							element: this.dom.find(".admins.carousel"),
							next_button: dom.find('.admin-carousel-next'),
							prev_button: dom.find('.admin-carousel-prev')
						});
						
						merlin.current_step.runtime_data.n_to_fetch = 10;
						merlin.current_step.runtime_data.offset = merlin.current_step.components.admins_pagination.carousel.getItems().first().find('tr').length;
						
						dom.find('input').bind('change', {me:merlin, dom:dom}, merlin.current_step.fn.admin_input_change);
						dom.find('a.delete').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.delete_admin);
						
						merlin.current_step.components.admins_pagination.carousel.getRoot().bind('onSeek', {me:merlin,dom:dom}, function(e,d){
							e.data.me.current_step.runtime_data.current_page = e.data.me.current_step.components.admins_pagination.carousel.getItems().eq(e.data.me.current_step.components.admins_pagination.carousel.getIndex());
							if(!e.data.me.current_step.runtime_data.current_page.hasClass('loaded')){
								e.data.me.current_step.runtime_data.current_page.addClass('loaded');
								tc.jQ.ajax({
									type:"GET",
									url:"/admin/users",
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
											tc.util.log("/admin/users: json parsing error", "warn");
											return;
										}
										if(!d.length){
											this.current_step.runtime_data.current_page.remove();
											return;
										}
										if(d.length == this.current_step.runtime_data.n_to_fetch){
											this.current_step.components.admins_pagination.carousel.addItem('<li>\
												<table class="active-admins-table">\
													<tbody>\
														<tr>\
															<td class="spinner-message clearfix">\
																<p class="west">Saving Blacklist...</p>\
																<img class="loading" src="/static/images/loader32x32.gif" />\
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
											temprow.find('input.radio-admin').attr('id','user-role-'+d[i].user_id+'-radio-admin').attr('name','user-role-'+d[i].user_id+'-radio').attr('rel','setRole,'+1+','+d[i].user_id).siblings('label').attr('for','user-role-'+d[i].user_id+'-radio-admin');
											temprow.find('input.checkbox-oncall').attr('id','user-oncall-'+d[i].user_id+'-check').attr('name','user-oncall-'+d[i].user_id+'-check').attr('rel','setOncall,'+d[i].user_id).siblings('label').attr('for','user-oncall-'+d[i].user_id+'-check');
											if(d[i].is_leader){
												temprow.find('input.radio-leader').attr('checked',true);
											}
											if(d[i].is_moderator){
												temprow.find('input.radio-moderator').attr('checked',true);
											}
											if(d[i].is_admin){
												temprow.find('input.radio-admin').attr('checked',true);
											}
											if(d[i].is_oncall){
												temprow.find('input.checkbox-oncall').attr('checked',true);
											}
											temprow.find('a.delete').attr('href','#delete,'+d[i].user_id);
											temptbody.append(temprow);
											this.current_step.runtime_data.offset++;
										}
										temptbody.find('input').bind('change', {me:this}, this.current_step.fn.admin_input_change);
										tc.util.dump(temptbody.find('a.delete'));
										temptbody.find('a.delete').bind('click', {me:this}, this.current_step.fn.delete_admin);
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
	
	app.components.add_admin_merlin = new tc.merlin(app,{
		name:'add-admin',
		dom:tc.jQ('.add-admin-merlin'),
		next_button:tc.jQ('a.admin-merlin-next-step'),
		data:{
			f_name:null,
			l_name:null,
			email:null,
			password:null,
			role:null,
			affiliation:null
		},
		use_hashchange:false,
		steps:{
			'main':{
				selector:'.add-admin-main',
				next_step:'finish',
				inputs:{
					f_name:{
						selector:'input.f_name',
						validators_new: function(merlin,dom,current_step){
							if(current_step.inputs.organization.dom.val().length){
								return tc.validate(dom,['min-3','max-64']);
							} else {
								return tc.validate(dom,['min-3','max-64','required']);
							}
						},
						validators:['min-3','max-64','required']
					},
					l_name:{
						selector:'input.l_name',
						validators_new: function(merlin,dom,current_step){
							if(current_step.inputs.organization.dom.val().length){
								return tc.validate(dom,['min-3','max-64']);
							} else {
								return tc.validate(dom,['min-3','max-64','required']);
							}
							
						},
						validators:['min-3','max-64','required']
					},
					email:{
						selector:'input.email',
						validators:['min-3','max-64','email','required']
					},
					password:{
						selector:'input.password',
						validators:['password-20','required']
					},
					organization:{
						selector:'input.organization',
						validators_new: function(merlin,dom,current_step){
							if(current_step.inputs.f_name.dom.val().length){
								return tc.validate(dom,['min-3','max-64']);
							} else {
								return tc.validate(dom,['min-3','max-64','required']);
							}
						},
						validators:['min-3','max-64']
					},
					role:{
						selector:'.add-admin-radio',
						validators:['required']
					}
				},
				init:function(merlin,dom){
					
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						f_name:merlin.current_step.inputs.f_name.dom.val(),
						l_name:merlin.current_step.inputs.l_name.dom.val(),
						email:merlin.current_step.inputs.email.dom.val(),
						password:merlin.current_step.inputs.password.dom.val(),
						role:merlin.current_step.inputs.role.dom.filter(':checked').val(),
						affiliation:merlin.current_step.inputs.organization.dom.val()
					});
				}
			},
			'error':{
				selector:'.add-admin-error'
			},
			'finish':{
				selector:'.add-admin-finish',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/user/add',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								this.show_step('error');
								return;
							}
							location.reload(true);
						}
					});
				}
			}
		}
	});
	
	app.components.blacklist_merlin = new tc.merlin(app,{
		name:'blacklist-merlin',
		dom:tc.jQ('.blacklist-merlin'),
		next_button:tc.jQ('a.blacklist-save-button'),
		data:{
			graylist:null,
			blacklist:null
		},
		use_hashchange:false,
		steps:{
			'main':{
				selector:'.blacklist-merlin-main',
				next_step:'finish',
				inputs:{
					graylist:{
						selector:'textarea.graylist',
						validators:[]
					},
					blacklist:{
						selector:'textarea.blacklist',
						validators:[]
					}
				},
				init:function(merlin,dom){
					
				},
				finish:function(merlin,dom){
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						graylist:merlin.current_step.inputs.graylist.dom.val(),
						blacklist:merlin.current_step.inputs.blacklist.dom.val()
					});
				}
			},
			'finish':{
				selector:'.blacklist-merlin-finish',
				init:function(merlin,dom){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/blacklist',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False' || data == 'None'){
								this.show_step('error');
								return;
							}
							location.reload(true);
						}
					});
				}
			}
		}
	});
	
	tc.jQ('.adminbar li.admin-settings').addClass('active');
	
});