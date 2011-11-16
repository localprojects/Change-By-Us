/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/


	app_page.features.push(function(app){
		tc.util.log('Give A Minute: User Account Admin');
		
		tc.jQ('a.delete-user').bind('click',{app:app},function(e,d){
			var t;
			e.preventDefault();
			t = e.target;
			if(t.nodeName == 'SPAN'){
				t = t.parentNode;
			}
			e.data.app.components.modal.show({
				app:app,
				source_element:tc.jQ('.modal-content.user-delete'),
				submit:function(modal,callback){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/user/delete',
						data:{
							user_id:t.hash.split(',')[1]
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
		
		tc.jQ('a.delete-resource').bind('click', {app:app}, function(e, d) {
			e.preventDefault();
			var $t;
			$t = tc.jQ(this);
			e.data.app.components.modal.show({
				app:e.data.app,
				source_element:tc.jQ('.modal-content.remove-resource'),
				submit:function(){
					tc.jQ.ajax({
						type:'POST',
						url:'/admin/resource/delete',
						data:{
							resource_id: $t.attr("href").split(',')[1]
						},
						context:$t,
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
		});
		
		
	});