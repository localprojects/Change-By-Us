/* ------------------------------------------------------------------------
	prettyCheckboxes
	
	Developped By: Stephane Caron (http://www.no-margin-for-errors.com)
	Inspired By: All the non user friendly custom checkboxes solutions ;)
	Version: 1.1
	
	Copyright: Feel free to redistribute the script/modify it, as
			   long as you leave my infos at the top.
------------------------------------------------------------------------- */
	
	jQuery.fn.prettyCheckboxes = function(settings) {
		settings = jQuery.extend({
					checkboxWidth: 20,
					checkboxHeight: 20,
					className : 'prettyCheckbox',
					display: 'list'
				}, settings);

		$(this).each(function(){
			var $input, $label;
			// Store the input
			$input = $(this);
			// Find the label
			$label = $('label[for="'+$(this).attr('id')+'"]');
			
			// Add the checkbox holder to the label, if it does not already exist;
			if(!$label.children('.holderWrap').length){
				$label.prepend("<span class='holderWrap'><span class='holder'></span></span>");
				// Assign the dimensions to the checkbox display
				$label.find('span.holderWrap').width(settings.checkboxWidth).height(settings.checkboxHeight);
				$label.find('span.holder').width(settings.checkboxWidth);
			}
			// If the checkbox is checked, display it as checked
			if($input.is(':checked')) { $label.addClass('checked'); };
			
			// Assign the class on the label
			$label.addClass(settings.className).addClass($(this).attr('type')).addClass(settings.display);
			
			// Hide the checkbox
			$input.addClass('hiddenCheckbox').addClass('has-prettycheckbox');
			
			// Associate the click event
			$label.unbind('click').bind('click', {input:$input}, function(e,d){
				var $label;
				$label = $(this);
				//e.data.input.triggerHandler('click');
				if(e.data.input.is(':checkbox')){
					$label.toggleClass('checked');
					if(e.data.input.attr('checked') == true){
						e.data.input.removeAttr('checked');
					} else {
						e.data.input.attr('checked',true);
					}
					
					if(e.data.input[0].checked == true){
						e.data.input[0].checked = false;
					} else {
						e.data.input[0].checked = true;
					}
					$label.find('span.holder').css('top',0);
				}else{
					$('input[name="'+e.data.input.attr('name')+'"]').each(function(){
						$('label[for="' + $(this).attr('id')+'"]').removeClass('checked');	
						$(this).removeAttr('checked');
						$(this)[0].checked = false;
					});
					
					$label.addClass('checked');
					e.data.input.attr('checked',true);
					e.data.input[0].checked = true;
				};
				if(!d || !d.preventChange){
					e.data.input.trigger('change');
				}
				
				// fixes IE bug (see #1500)
				e.preventDefault();
			});
			
			$('input#' + $label.attr('for')).unbind('keypress').bind('keypress', {label:$label}, function(e){
				var $input;
				$input = $(this);
				if(e.keyCode == 32){
					if($.browser.msie){
						e.data.label.toggleClass("checked");
					}else{
						$input.trigger('click');
					}
					return false;
				};
			});
		});
	};
