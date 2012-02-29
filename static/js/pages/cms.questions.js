/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/


app_page.features.push(function(app){
	tc.util.log('Give A Minute: Admin Settings');
	

	app.components.cms_admin_merlin = new tc.merlin(app,{
		name:'cms-questions',
		dom:tc.jQ('.merlin-questions'),
		data: {
			inline_editors: {}
		},
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
						e.preventDefault();
						var qId = e.currentTarget.href.split(',')[1];
						e.data.me.app.components.modal.show({
							app:e.data.app,
							source_element:tc.jQ('.modal-content.feature-question'),
							submit:function(){
								tc.jQ.ajax({
									type:'POST',
									url:'/cms/questions/feature',
									data:{
										question_id: qId
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
					edit_questions:function(e) {
						e.preventDefault();
						var qId = e.currentTarget.href.split(',')[1];
						var editor = app.components.cms_admin_merlin.options.data.inline_editors['q-' + qId];
						editor.edit();
					}
				},
				init:function(merlin,dom){
					tc.jQ('.headlands .tabs li').removeClass('active');
					tc.jQ('.headlands .tabs li.questions').addClass('active');
					
					if(app.components.add_questions_merlin){
						app.components.add_questions_merlin.show_step('main');
					}
					
					dom.find('input').bind('change', {me:merlin, dom:dom}, merlin.current_step.fn.questions_input_change);
					dom.find('a.feature').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.feature_questions);
					dom.find('a.edit').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.edit_questions);
					dom.find('a.delete').unbind('click').bind('click', {me:merlin, dom:dom}, merlin.current_step.fn.delete_questions);
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
						selector:'textarea.question',
						validators: ['min-3','max-160','required'],
						counter: {
	                      selector:'.charlimit.question',
	                      limit:160
	                    }
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
	
	// Create the inline editors and store them for later reference...
	var inline_editors = {}
	
	tc.jQ('.question-text').each(function(index, item) {
		$el = tc.jQ(item);
		inline_editors[$el.attr('id')] = new tc.inlineEditor({
			dom: $el,
			service: {
				url: "/cms/questions/edit",
				param: "question",
				charlimit: 160,
				post_data: {
					question_id: $el.attr('id').split('-')[1] 
				}
			}
		})
	});
	
	// Save instances of these inline editors so we can manually call the `edit`
	// method on them when the edit button is clicked.
	app.components.cms_admin_merlin.options.data.inline_editors = inline_editors
			
	tc.jQ('.adminbar li.homepage-questions').addClass('active');
	
});
