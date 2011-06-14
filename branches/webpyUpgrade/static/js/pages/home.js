app_page.features.push(function(app){
		tc.util.log('Give A Minute: HOME');
		
		tc.jQ('a.toc-link').bind('click',{
			app:app,
			source_element:tc.jQ('.modal-content.toc'),
			init:function(modal,callback){
				if(tc.jQ.isFunction(callback)){
					callback(modal);
				}
			}
		},function(e,d){
			e.preventDefault();
			e.data.app.components.modal.show(e.data);
		});
		
		app.components.merlin = new tc.merlin(app,{
			dom:tc.jQ('.splash-container.merlin'),
			progress_element:tc.jQ('.merlin-progress'),
			next_button:tc.jQ('.primary-action .ca-btn'),
			error_indicator:tc.jQ('.oops'),
			watch_keypress:true,
			first_step:'start',
			data:{
				text:null,
				email:null,
				location_id:null,
				main_text:""
			},
			steps:{
				'start':{
					prev_step:null,
					next_step:'idea-details',
					selector:'.note-card-submit-idea',
					inputs:{
						idea:{
							selector:'textarea.idea',
							validators:['min-3','max-175','required'],
							hint:'',
							focus_first:true,
							counter:{
								selector:'.charlimit.idea',
								limit:175
							},
							handlers:{
								focus:function(e){
									e.data.me.options.error_indicator.hide();
								}
							}
						},
						main_text:{
							selector:'input.main_text',
							validators:['min-0']
						}
					},
					init:function(merlin,dom){
						tc.jQ('.note-card-submit-idea textarea').attr("disabled", false);
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							text:merlin.current_step.inputs.idea.dom.val(),
							main_text:merlin.current_step.inputs.main_text.dom.val()
						});
					}
				},
				'idea-details':{
					prev_step:'start',
					force_prev_step:'start',
					next_step:'idea-processing',
					selector:'.step-info',
					inputs:{
						email:{
							selector:'input.email',
							validators:['min-3','max-200','required','email'],
							hint: (app_page.data.user && app_page.data.user.email ? false : 'Please enter your email address'),
							focus_first:true
						},
						location:{
							selector:'.location-group',
							validators:tc.locationDropdown.validator,
							hint:'Start typing neighborhood or borough...'
						}
					},
					step_data:{},
					
					transition:function(merlin,dom){
						var i, elements, phases;
						
						elements = {
							question:merlin.dom.find('.question-wrap')
						};
						
						elements.question.animate({
							opacity:0.0,
							width:'0px'
						},600,'easeOutQuint',function(){
							elements.question.hide();
							
							elements.pane = merlin.dom.find('.top-pane');
							elements.counter = merlin.dom.find('.note-card-submit-idea .charlimit');
							elements.textarea = merlin.dom.find('.note-card-submit-idea textarea');
							elements.more_info = merlin.dom.find('.more-info');
							elements.step_info = merlin.dom.find('.step-info');
							elements.info_input = merlin.dom.find('.info-input');
							
							tc.animate_bg(elements.pane,5,7.5);
							
							if (isMsie8orBelow != true) {
								elements.more_info.css({
									opacity:0.0
								}).show().animate({
									opacity:1.0
								},550,'easeOutQuint');
							} else {
								elements.more_info.show();
							};
							
							elements.counter.hide();
							elements.textarea.attr("disabled", true);
							
							elements.info_input.css({
								height:'0px'
							})
							elements.step_info.show();
							elements.info_input.show().animate({
								height:'180px'
							},600,'easeOutQuint');
						});
						
					},
					init:function(merlin,dom){
						if(!merlin.current_step.step_data.locationDropdown){
							merlin.current_step.step_data.locationDropdown = new tc.locationDropdown({
								radios:dom.find('input[type=radio]'),
								input:dom.find('input.location-hood-enter'),
								list:dom.find('div.location-hood-list'),
								warning:dom.find('span.error'),
								locations:merlin.app.app_page.data.locations
							});
						};
						
						if(app_page.data.user && app_page.data.user.email){
							tc.jQ('#email').addClass('always-focused disabled').attr("disabled", true);
						};
						
					},
					finish:function(merlin,dom){
						merlin.options.data = tc.jQ.extend(merlin.options.data,{
							email:merlin.current_step.inputs.email.dom.val(),
							location_id:merlin.current_step.step_data.locationDropdown.getLocation()
						});
					}
				},
				
				'idea-processing':{
					prev_step:'idea-details',
					next_step:'related',
					selector:'.idea-processing',
					transition:function(merlin,dom){},
					init:function(merlin,dom){
						tc.jQ.ajax({
							type:'POST',
							url:'/idea',
							data:merlin.options.data,
							context:merlin,
							dataType:'text',
							success:function(data,ts,xhr){
								if(data == 'False'){
									return false;
								}
								this.options.data.idea_id = data;
								this.dom.siblings('.note-card-pane').find('strong').text('You');
								this.dom.siblings('.note-card-pane').find('em').text('say');
								this.dom.siblings('.note-card-pane').find('cite').show();
								this.dom.siblings('.note-card-pane').find('blockquote').html('<p>'+merlin.options.data.text+'</p>');
								window.location.hash = 'related-processing';
							}
						});
					}
				},
				
				'related-processing':{
					prev_step:'idea-details',
					next_step:null,
					selector:'.related-processing',
					transition:function(merlin){
						var elements;
						elements = {
							hey:merlin.dom.siblings('.hey'),
							submit_button:merlin.dom.find('.primary-action'),
							splash:merlin.dom.find('.splash'),
							bkg:merlin.dom.find('.splash-background')
						}
						
						elements.hey.animate({
							top:'-210px'
						},1200,'easeOutCubic');
						
						elements.submit_button.animate({
							left:'500px'
						},1200, 'easeOutCubic',function(){
							elements.submit_button.hide();
						});
						
						elements.bkg.animate({
							marginLeft:'-220px'
						},1200,'easeInOutQuart');
						
						elements.splash.animate({
							marginLeft:'-1260px'
						},1200,"easeInOutQuart", function(){
							window.location.hash = 'related-processing-2';
						});
						
					}
				},
				'related-processing-2':{
					prev_step:'idea-details',
					next_step:null,
					selector:'.related-processing',
					init:function(merlin,dom){
						tc.jQ.ajax({
							url:'/idea/related',
							data:merlin.options.data,
							context:merlin,
							dataType:'json',
							success:function(data,ts,xhr){
								if(data.citywide.length > 0 || data.related.length > 0){
									this.options.steps['related'].step_data = data;
									window.location.hash = 'related';
								} else {
									window.location.hash = 'related-not-found';
								}
							}
						});
					}
				},
				'related':{
					prev_step:'idea-details',
					force_prev_step:'related',
					next_step:null,
					selector:'.step-three',
					init:function(merlin,dom){
						
						function build_project_items(data, selector) {
							var i, temphtml, box;
							box = dom.find(selector);
							box.find("ul").children().remove();
							for (i in data) {
								if (i == 2) { break; }
								temphtml = tc.jQ('.template-content.project-item').clone().removeClass('template-content');
								if (data[i].image_id > -1){
									temphtml.find('img').attr('src',app_page.media_root + 'images/'+(data[i].image_id % 10)+'/'+data[i].image_id+'.png');
								} else {
									temphtml.find('img').attr('src','/static/images/thumb_genAvatar50.png');
								}
								temphtml.find('.link a').html( tc.truncate(data[i].title, 45) )
									.attr('href','/project/'+ data[i].project_id)
									.attr("target", "_blank");
								temphtml.find('.creator').html('<span class="creator"><em>Created by </em> <a href="/useraccount/'+ data[i].owner.u_id +'">'+ data[i].owner.name +'</a></span>');
								temphtml.find('.description').html( tc.truncate(data[i].description, 110) );
								temphtml.find('.member-count').text(data[i].num_members);
								if (data[i].endorsement) {
									temphtml.find('.endorser-thumb').show();
								}
								box.find("ul").append(temphtml);
								box.css("opacity", 0.0).show().animate({
									opacity:1.0
								}, 100, "easeOutCubic");
							}
						}
						
						if(merlin.current_step.step_data){
							if(!merlin.current_step.step_data.related.length && !merlin.current_step.step_data.citywide.length){
								window.location.hash = 'related-not-found';
								return;
							}
							
							if(!merlin.current_step.step_data.related.length){
								dom.find('.related-projects').hide();
								dom.find('.citywide-projects').addClass('single');
							} else {
								build_project_items(merlin.current_step.step_data.related, ".related-projects");
							}
							if(!merlin.current_step.step_data.citywide.length){
								dom.find('.citywide-projects').hide();
								dom.find('.related-projects').addClass('single');
							} else {
								build_project_items(merlin.current_step.step_data.citywide, ".citywide-projects");
							}
							
							if (merlin.options.steps['idea-details'].step_data.locationDropdown.getLocation() > 0) {
								dom.find("a.more-projects-related").attr("href", "search?terms=&location_id="+merlin.options.steps['idea-details'].step_data.locationDropdown.getLocation()+"#projects");
							} else {
								dom.find("a.more-projects-related").attr("href", "/search?terms="+ merlin.current_step.step_data.search_terms.split(",").join("+") +"#projects").text('See more related projects &rarr;');
							}
						}
					}
				},
				'related-not-found':{
					prev_step:'idea-details',
					force_prev_step:'related-not-found',
					next_step:null,
					selector:'.related-not-found',
					init:function(merlin,dom){
						tc.jQ('.projects-pane.not-found').fadeIn();
					}
				}
			}
		});
		
		// .small-note arrange
		function arrangeNotes() {
			//settings
			var gridDistance = 48; // spacing between notes, in pixels
			var maxOffset = 14; // maximum random offset from given position, in pixels
			
			// selectors
			var theArea = $('.small-note-area');
			var smallNote = $('.small-note-area .small-note');
			
			// initial values
			var positionX = 0 - gridDistance;
			var positionY = 0;
			var rowCount = 0;
			
			var maxX = theArea.width() - 45;
			var maxY = theArea.height() - 46;
			
			// loops through and positions each small note; also adds bg
			for(var i = 0; i < smallNote.length; i++) {
				var thisNote = smallNote.eq(i);
				
				// set initial position according to gridDistance
				positionX = positionX + gridDistance;
				if (positionX > maxX) { 
					if (rowCount%2 == 0) { positionX = gridDistance / 2 } 
					else { positionX = 0 - gridDistance };
					positionY = positionY + (gridDistance / 2);
					rowCount++;
				};
				
				// z-index & new position
				var posOrNegOffset = 1;
				var randomZindex = Math.floor(Math.random()*(100)) + 5;
				var newX = positionX + (Math.floor(Math.random()*maxOffset) * posOrNegOffset);
				var newY = positionY + (Math.floor(Math.random()*maxOffset) * posOrNegOffset);
				
				// randomly place note if it falls out-of-bounds
				if (newX > maxX || newX < 0) { newX = Math.floor(Math.random()*(maxX + 1)); }
				if (newY > maxY || newY < 0) { newY = Math.floor(Math.random()*(maxY + 1)); }
			
				// background image
				var bgImgClass;
				var bgImgColor = Math.floor(Math.random()*5);
				var bgImgCounter = i%3 + 1;
				
				if (bgImgCounter == 1 && i%2 == 0) { bgImgCounter++ }; // makes style 1 of the small notes less common
				
				
				if      (bgImgColor == 0) { bgImgClass = "a" + bgImgCounter; thisNote.addClass('color1') }
				else if (bgImgColor == 1) { bgImgClass = "b" + bgImgCounter; thisNote.addClass('color2') }
				else if (bgImgColor == 2) { bgImgClass = "c" + bgImgCounter; thisNote.addClass('color3') }
				else if (bgImgColor == 3) { bgImgClass = "d" + bgImgCounter; thisNote.addClass('color4') }
				else					  { bgImgClass = "e" + bgImgCounter; thisNote.addClass('color5') };
				
				// set style
				thisNote.addClass(bgImgClass).css({'display' : 'block', 'top' : newY, 'left' : newX, 'zIndex' : randomZindex});
			};
		};
		
		/*	THIS IS NOW IN BASE.HTML	
		var isMsie8orBelow = false;
		if( ua && ua.msie && ua.version < 9 ) {
			isMsie8orBelow = true;
		};
		*/
		
		// .small-note hover and click	
		function smallNoteEvents() {
			var hoverZindexCounter = 106;
			var bigNoteCardContentArea = tc.jQ(".note-card-splash");
			var bigNoteCardIdeaInputContainer = tc.jQ(".note-card-submit-idea");
			var bigNoteCardIdeaInputTextarea = tc.jQ(".note-card-submit-idea textarea");
			var noteCardPane = tc.jQ(".note-card-pane");
						
			var hoveredNoteTop;
			
			var ideaInputIsEmpty = true;
			
			$(".small-note").hover(
				function () {
					var thisNote = tc.jQ(this);
					
					if (bigNoteCardIdeaInputTextarea.val() == '') { 
						ideaInputIsEmpty = true 
					} else { 
						ideaInputIsEmpty = false 
					};
					
					tc.jQ(this).css({'zIndex' : hoverZindexCounter});
					
					if (ideaInputIsEmpty == true) {
						var colorNum;

						if      (thisNote.hasClass('color1')) { colorNum = 1 }
						else if (thisNote.hasClass('color2')) { colorNum = 2 }
						else if (thisNote.hasClass('color3')) { colorNum = 3 }
						else if (thisNote.hasClass('color4')) { colorNum = 4 }
						else							 	  { colorNum = 5 };

						var theContents = $(this).find('div').html();			

						if( isMsie8orBelow == true ) {
							bigNoteCardIdeaInputContainer.hide();
							bigNoteCardContentArea.show().html( theContents );
						} else {
							bigNoteCardIdeaInputContainer.hide();
							bigNoteCardContentArea.stop(true, true).fadeOut(50);
							bigNoteCardContentArea.html( theContents ).fadeIn(150);
						};

						if (noteCardPane.hasClass('color' + colorNum)) {
							// do nothing
						} else {
							noteCardPane.removeClass('color1 color2 color3 color4 color5').addClass('color' + colorNum);
						};
					};
					
					if( isMsie8orBelow != true ) {
						hoveredNoteTop = tc.jQ(this).position().top;
						tc.jQ(this).animate({ 
							top: "-=3px"
						}, { "duration": 400, "easing": "easeOutCubic" });
					}
				},
				function () {
					if( isMsie8orBelow != true ) {
						tc.jQ(this).stop(true, true).animate({ 
							top: hoveredNoteTop+"px"
						}, { "duration": 50, "easing": "swing" });
					}
					hoverZindexCounter++;
				}
			);
			
			tc.jQ(".projects-pane").mouseleave(function () {
				if (ideaInputIsEmpty == true) {
					if( isMsie8orBelow == true ) {
						bigNoteCardContentArea.hide();
						bigNoteCardIdeaInputContainer.show();
						noteCardPane.removeClass('color1 color2 color3 color4 color5').addClass('color3');
					} else {
						bigNoteCardContentArea.stop(true, true).fadeOut(50);
						noteCardPane.removeClass('color1 color2 color3 color4 color5').addClass('color3');
						bigNoteCardIdeaInputContainer.fadeIn(125);
					}
				}
			});
		};
		
		arrangeNotes();
		smallNoteEvents();
		
		// show .hand
		tc.jQ('.hand').addClass('hand' + (Math.floor(Math.random()*3) + 1)).show();
		
		// turn location field autocomplete off
		tc.jQ('#location-hood-enter').attr('autocomplete', 'off');
		
		// focus idea input
		tc.jQ('textarea.idea').focus();

	});
