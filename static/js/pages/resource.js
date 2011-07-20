app_page.features.push(function(app){
	tc.util.log('Give A Minute: Resource Addition');
	
	tc.jQ('a.upload-link').bind('click',{
		app:app,
		source_element:tc.jQ('.modal-content.upload-image'),
		init:function(modal,callback){
			
			var uploader = new qq.FileUploader({
				element: modal.options.element.find('.file-uploader').get(0),
				action: '/create/photo',
				debug:false,
				onComplete: function(id, fileName, responseJSON){
					
					tc.jQ(document).trigger('create-image-uploaded',{
						id:id,
						fileName:fileName,
						responseJSON:responseJSON
					});
					
					return true;
					
				}
			});
			if(tc.jQ.isFunction(callback)){
				callback(modal);
			}
		}
	},function(e,d){
		e.preventDefault();
		e.data.app.components.modal.show(e.data);
	});
	
	app.components.merlin = new tc.merlin(app,{
		dom:tc.jQ('.merlin.resource-addition'),
		next_button:tc.jQ('#add-org'),
		first_step:'resource-form',
		data:{
			title:null,
			description:null,
			physical_address:null,
			location_id: null,
			url: null,
			facebook_url:null,
			twitter_url:null,
			keywords: null,
			contact_name: null,
			contact_email: null,
			image: null,
			main_text:""
		},
		steps:{
			'resource-form':{
				selector:'.resource-form',
				next_step:'finish',
				inputs:{
					name:{
						selector:'input.name',
						validators:['min-3','max-50','required'],
						hint:'',
						counter:{
							selector:'.row-name .charlimit',
							limit:50
						}
					},
					description:{
						selector:'textarea.description',
						validators:['min-3','max-400','required'],
						hint:'',
						counter:{
							selector:'.row-description .charlimit',
							limit:400
						}
					},
					address:{
						selector:'input.address',
						validators:['min-3','max-75','required'],
						hint:''
					},
					location:{
						selector:'.location-group',
						validators:tc.locationDropdown.validator,
						hint:'Start typing neighborhood or borough...'
					},
					web:{
						selector:'input.web',
						validators:['min-3','max-512','url'],
						hint:''
					},
					twitter:{
						selector:'input.twitter_url',
						validators:['min-3','max-512','url'],
						hint:''
					},
					facebook:{
						selector:'input.facebook_url',
						validators:['min-3','max-512','url'],
						hint:''
					},
					keywords:{
						selector:'input.keywords',
						validators:['min-3','max-200','required'],
						hint:''
					},
					contact:{
						selector:'input.contact',
						validators:['min-3','max-50','required','email'],
						hint:''
					},
					tos_agree:{
						selector:'input#agree-tos',
						validators:['required']
					},
					main_text:{
						selector:'input.main_text',
						validators:['max-0']
					}
				},
				step_data:{},
				init:function(merlin,dom){
					tc.jQ(document).unbind('create-image-uploaded').bind('create-image-uploaded',{merlin:merlin}, function(e, d){
						e.data.merlin.app.components.modal.hide();
						if(d.responseJSON.thumbnail_id){
							merlin.dom.find('img.proj').attr('src',e.data.merlin.app.app_page.media_root+'images/'+(d.responseJSON.thumbnail_id % 10)+'/'+d.responseJSON.thumbnail_id+'.png');
							merlin.options.data.image = d.responseJSON.thumbnail_id;
						}
					});
					if(!merlin.current_step.step_data.locationDropdown){
						merlin.current_step.step_data.locationDropdown = new tc.locationDropdown({
							radios:dom.find('input[type=radio]'),
							input:dom.find('input.location-hood-enter'),
							list:dom.find('div.location-hood-list'),
							warning:dom.find('span.error'),
							locations:merlin.app.app_page.data.locations
						});
					};
					dom.find('input.location-hood-enter').attr('autocomplete', 'off');
				},
				finish:function(merlin,dom){
					
					merlin.options.data = tc.jQ.extend(merlin.options.data,{
						title:merlin.current_step.inputs.name.dom.val(),
						description:merlin.current_step.inputs.description.dom.val(),
						physical_address:merlin.current_step.inputs.address.dom.val(),
						location_id:merlin.current_step.step_data.locationDropdown.getLocation(),
						url:merlin.current_step.inputs.web.dom.val(),
						facebook_url:merlin.current_step.inputs.facebook.dom.val(),
						twitter_url:merlin.current_step.inputs.twitter.dom.val(),
						keywords:merlin.current_step.inputs.keywords.dom.val(),
						contact_email:merlin.current_step.inputs.contact.dom.val(),
						main_text:merlin.current_step.inputs.main_text.dom.val()
					});
				}
			},
			'finish':{
				selector:'.finish',
				init:function(merlin,dom){
					window.scroll(0,0);
					
					tc.jQ.ajax({
						type:'POST',
						url:'/resource',
						data:merlin.options.data,
						context:merlin,
						dataType:'text',
						success:function(data,ts,xhr){
							if(data == 'False'){
								return false;
							}
						}
					});
				}
			}
		}
	});
	
});