/*********************************************************************

jqDropDown v1.0
http://uraniuminteractive.com

Copyright 2011, Frank Parent for Uranium Interactive
Free to use and abuse under the MIT license.
http://www.opensource.org/licenses/mit-license.php

+ February 2011 - Module creation

**********************************************************************/


(function($, window) {

    var DropDown = function(element, settings) {

        // Get this dropdown
        var $dropdown = $(element),

        // Extend the default options with those provided
		settings = $.extend({}, $.fn.jqDropDown.defaults, settings),
		listWidth,

        // Gather the information needed to build the new dropdown container
		$container,
		defaultOption = settings.defaultOption,
		selectedLabel,
		$toggleLink,
		$options,
		effect = settings.effect,
		effectSpeed = settings.effectSpeed,

        // The new Option List
		$optList = $('<ul class="' + settings.optionListName + '" style="display:none;"></ul>');

        // Get the list's width based on the largest item whil it is still visible
        listWidth = $dropdown.width();

        // Hide the original semantic markup built with select & options and add the new container to the DOM
        $dropdown.hide().after('<div class="' + settings.containerName + '" style="position:relative;"></div>');

        // If there's a defautOption in the config, use it as the toggle link; else, use the already selected element of the first one.
        if (defaultOption && defaultOption !== '') {
            selectedLabel = defaultOption;
        } else {
            selectedLabel = $dropdown.find('option[selected]').text() || $dropdown.find('option:eq(0)').text();
        }

        // Append the toggle hyperlink to the new DropDown container
        $toggleLink = $('<a href="#" class="' + settings.toggleBtnName + '">' + selectedLabel + '</a>');
        $container = $dropdown.next('div.' + settings.containerName);
        $container.append($toggleLink);

        // Create the Option list based on all the option from the original select
        $optList.append(BuildOptionList($dropdown, settings));
        $options = $optList.find('a');
        $toggleLink.after($optList);

        // Style every elements of the dropdown to make them looks like the original
        ApplyStyle($container, listWidth, settings);

        // Closes the Option List when the user clicks anywhere on the body
        $(document).bind('mousedown', function(e) {
            var self = this, $target = $(e.target);

            // Make sure that the element with the focus is the toggle link of the list
            if ($(document.activeElement).hasClass(settings.toggleBtnName) || $(document.activeElement).hasClass(settings.optionListName)) {

                // Make sure that the element clicked is not the toggle button or an optgroup
                if (!$target.hasClass(settings.optionGroupName) && !$target.hasClass(settings.toggleBtnName)) {
                    // An option from the list was clicked
                    if ($target.parents().filter($optList).length) {
                        $toggleLink.data('index', $optList.find('li').index($target.parent())).focus();
                        
                        SelectRelatedOpt($dropdown, $target);
                        UpdateValue($toggleLink, $target, settings);

                        // Trigger the optionChanged callback
                        settings.optionChanged($target);
                    }

                    // The user clicked somewhere else in the window while the list was opened; we cose it and keep focus
                    else if ($(document.activeElement).hasClass(settings.toggleBtnName) && $optList.is(':visible').length) {
                        effect === 'fade' ? $optList.fadeOut(effectSpeed) : $optList.hide();
                        return false;
                    }

                    // The user clicked somewhere else in the window while the list was close; we just need to get rid of the focus
                    else if ($(document.activeElement).hasClass(settings.toggleBtnName) && !$optList.filter(':visible').length) {
                        $toggleLink.blur();
                        return false;
                    }

                    // Prevent the list from closing if the setting modal is true and something else was clicked in the window
                    else if (settings.modal) {
                        return false;
                    }

                    effect === 'fade' ? $optList.fadeOut(effectSpeed) : $optList.hide();
                    return false;
                } else {
                    return false;
                }
            }

        });

        // Update the selected option on mouseover 
        $options.bind('mouseenter click', function(e) {
            var $this = $(this);

            e.preventDefault();

            $optList.find('a.selected').removeClass('selected');
            $this.addClass('selected');

            // Update the selected index value
            $toggleLink.data('index', $optList.find('li').index($this.parent()));
        });

        // Initialize the toggle button and the event of the dropdown
        $toggleLink.bind('mousedown keydown focusout click', function(e) {
            // Store data about the selected option
            var $this = $(this),
			$targetOption,
			selectedIndex = $this.data('index') || 0,
			indexChanged = false, escape = false,

            // Store data concerning the actual options list
			$selectedOption,
			$options = $optList.find('a'),

            // Key pressed and search options
			key;

            // Toggle the option list with the corresponding option selected
            if (e.type === 'mousedown' && e.which === 1) {

                // Trigger the beforeToggle callback
                settings.beforeToggle.call(this);

                // Update the List opening direction
                UpdateListDirection($this, $optList, settings)

                // Remove the selected option
                $options.removeClass('selected');

                // Add focus to the clicked toggle hyperlink and selected the matching option
                $this.focus();
                $optList.find('li:eq(' + selectedIndex + ') a').addClass('selected');

                if ($optList.is(':hidden')) {
                    effect === 'fade' ? $('.' + settings.optionListName).fadeOut(effectSpeed) : $('.' + settings.optionListName).hide();
                    effect === 'fade' ? $optList.fadeIn(effectSpeed) : $optList.show();
                } else {
                    effect === 'fade' ? $optList.fadeOut(effectSpeed) : $optList.hide();
                }

                // Trigger the afterToggle callback
                settings.afterToggle.call(this);
            }

            // Allow keyboard navigation of the different options, like the default Select
            if (e.type === 'keydown') {
                switch (e.keyCode) {
                    case 9:  // [TAB] key was pressed
                        escape = true;
                        effect === 'fade' ? $optList.fadeOut(effectSpeed) : $optList.hide();
                        break;

                    case 27:  // [Escape] key was pressed
                        escape = true;
                        effect === 'fade' ? $optList.fadeOut(effectSpeed) : $optList.hide();
                        break

                    case 13:  // [ENTER] key was pressed
                        $(document).trigger('mousedown', [{ target: $optList.find('li:eq(' + $this.data('index') + ') a:eq(0)')}]);
                        break;

                    case 38:  // Up arrow was pressed
                        e.preventDefault();
                        $options.removeClass('selected');

                        for (var i = selectedIndex - 1; i >= 0; i--) {
                            $targetOption = $optList.find('li:eq(' + (i) + ')');

                            if (!$targetOption.hasClass(settings.optionGroupName)) {
                                selectedIndex = i;
                                break;
                            }
                        }
                        break;

                    case 40:  // Down arrow was pressed
                        e.preventDefault();
                        $options.removeClass('selected');

                        for (var i = selectedIndex + 1; i < $optList.find('li').length; i++) {
                            $targetOption = $optList.find('li:eq(' + (i) + ')');

                            if (!$targetOption.hasClass(settings.optionGroupName)) {
                                selectedIndex = i;
                                break;
                            }
                        }
                        break;

                    default:  // Check if the key pressed matches the first letter of an option, and loop through them if multiple
                        key = String.fromCharCode(e.which).toLowerCase();

                        for (var i = selectedIndex + 1; i < $optList.find('li').length; i++) {
                            $targetOption = $optList.find('li:eq(' + (i) + ')');

                            if ($targetOption.text().slice(0, 1).toLowerCase() === key && !$targetOption.hasClass(settings.optionGroupName)) {
                                $options.removeClass('selected');
                                selectedIndex = i;
                                indexChanged = true;
                                break;
                            }
                        }

                        if (!indexChanged) {
                            for (var i = 0; i < selectedIndex; i++) {
                                $targetOption = $optList.find('li:eq(' + (i) + ')');

                                if ($targetOption.text().slice(0, 1).toLowerCase() === key && !$targetOption.hasClass(settings.optionGroupName)) {
                                    $options.removeClass('selected');
                                    selectedIndex = i;
                                    break;
                                }
                            }
                        }
                        break;
                }

                if (!escape) {
                    // Update the corresponding index
                    $this.data('index', selectedIndex);

                    $selectedOption = $optList.find('li:eq(' + $this.data('index') + ') a:eq(0)');
                    $selectedOption.addClass('selected');
                    SelectRelatedOpt($dropdown, $target);
                    UpdateValue($this, $selectedOption, settings);
                }
            } else {
                // Prevent the default hyperlink behavior and stops delegation on event from the body;
                // Simulate preventDefault() and stopPropagation() with "Return false"
                return false;
            }
        });
    };


    // Select the associated option in the hidden list for form submit purpose
    function SelectRelatedOpt($dropdown, $target) {
        var selOptVal = $target.attr('rel') || $target.text();

        $dropdown.find('option').each(function() {
            var $this = $(this);

            if($this.val() === selOptVal || $this.text() === selOptVal ) {
                $this.trigger('select').attr('selected', true);
            }

        });
    }

    // Update the text value of the toggle hyperlink
    function UpdateValue($target, $elem, settings) {
        var $ph, val;

        if ($elem && $elem.text() !== '') {
            $target.text($elem.text()).append('<span></span>');
        }

        // If a placeholder was specified in the settings, assign the selected value to it
        if (settings.placeholder) {
            $ph = $(settings.placeholder);

            // Determine the value to be assigned to the placeholder based on the option and container's type
            settings.useValue ? val = $elem.attr('rel') : val = $elem.text();
            if ($ph.is('input')) {
                $ph.val(val);
            } else {
                $ph.text(val);
				$ph.addClass('changed');
            }
        }
    }


    // Dynamically construct the option list's markup
    function BuildOptionList($list, settings) {
        var optList, i,

        // The markup containing all the option
		listItem = '', $curItem, isSelected = '';

        if (settings.data.length) {
            optList = settings.data;
        } else {
            optList = $list.find('option,optgroup');
        }

        // Add the default option found in the settings
        if (settings.defaultOption && settings.defaultOption !== '') {
            listItem += '<li class="' + settings.optionName + '"><a href="#">' + settings.defaultOption + '</a></li>';
        }

        for (i = 0; i < optList.length; i++) {
            $curItem = $(optList[i]);

            // Check if the current option is selected; if so, add a class
            if ($curItem.is(':selected') && !settings.defaultOption) {
                isSelected = 'selected';
            }

            if ($curItem.is('option')) {
                listItem += '<li class="' + settings.optionName + '"><a class="' + isSelected + '" href="#" rel="' + $curItem.attr('value') + '">' + $curItem.text() + '</a></li>';
            } else {
                listItem += '<li class="' + settings.optionGroupName + '">' + $curItem.attr('label') + '</li>';
            }

            isSelected = '';
        }

        return listItem;
    }


    // Overwrite default style for certain element like the dynamic option list's width, padding, etc...
    function ApplyStyle($container, lisWidth, settings) {
        var $list = $container.find('ul:eq(0)'),
			$listItems = $container.find('ul > li > a'),

        // Data about the toggle hyperlink
			$toggleLink = $container.find('a:eq(0)'),
			toggleLinkPadding = parseInt($toggleLink.css("padding-left"), 10) + parseInt($toggleLink.css("padding-right"), 10),

        // Data about the options
			defaultOpt_padding;

        UpdateListDirection($toggleLink, $list, settings);

        if (settings.defaultStyle) {
            // Adjust the default padding-left properties of the LI if there are optgroup
            $container.find('li.' + settings.optionGroupName).length > 0 ? defaultOpt_padding = 20 : defaultOpt_padding = 4;

            // Style the list to make it look like the default Select
            $list.css({
                width: lisWidth + toggleLinkPadding //+ defaultOpt_padding
            });

            // Style the toggle hyperlink according to the largest option in the list
            $toggleLink.css({
                width: $list.width() - toggleLinkPadding
            }).append('<span></span>');

            // Style the list items to make them like the default Options
            $listItems.css({
                'padding-left': defaultOpt_padding
            });
        }
    }


    // Calculate the height of the list compared to the viewport's height and update the direction it opens
    function UpdateListDirection($toggleLink, $list, settings) {
        var topPos, toggleLinkPadding, borderWidth,

        // Cache all the select element of the page
		$select = $('select'),
		counter,
		direction;

        // Calculate the padding and borders of the toggle hyperlink to position list correctly
        toggleLinkPadding = parseInt($toggleLink.css("padding-top"), 10) + parseInt($toggleLink.css("padding-bottom"), 10) || 0;
        borderWidth = parseInt($toggleLink.css("border-top-width"), 10) + parseInt($toggleLink.css("border-bottom-width"), 10) || 0;

        topPos = $toggleLink.height() + toggleLinkPadding + borderWidth;
        direction = 'down';

        $list.css({
            top: topPos
        });

        // If IE6 or IE7, fix the overlay of the lists close to each other by adding dynamic z-index to the containers based on the list direction
        if ($.browser.msie && $.browser.version === '6.0' || $.browser.version === '7.0') {

            // Start the container index correctly based on the the list direction
            direction === 'up' ? counter = 0 : counter = $select.length;

            $select.each(function() {
                $(this).next('div').css({ 'z-index': counter });

                if (direction === 'up') {
                    counter += 1;
                } else {
                    counter -= 1;
                }
            });
        }
    }


    $.fn.jqDropDown = function(options) {
        return this.each(function() {
            var $this = $(this);

            // Return early if this element already has a plugin instance
            if ($this.data('jqDropDown')) { return; }

            // Pass options to plugin constructor
            var dropdown = new DropDown(this, options);

            // Store plugin object in this element's data
            $this.data('jqDropDown', dropdown);
        });
    };


    $.fn.jqDropDown.Debug = function($obj) {
        if (window.console && window.console.log) {
            window.console.log('hilight selection count: ' + $obj.text());
        }
    };


    // Set the default values, use comma to separate the settings, example:
    $.fn.jqDropDown.defaults = {
        effect: 'default',
        effectSpeed: 400,
        modal: false,
        data: {},
        defaultOption: null,
        containerName: 'ddContainer',
        toggleBtnName: 'ddToggle',
        optionListName: 'ddOptionList',
        optionGroupName: 'optgroup',
        optionName: 'ddOption',
        defaultStyle: true,
        placeholder: null,
        useValue: true,
        direction: 'down',
        beforeToggle: function() { },
        afterToggle: function() { },
        optionChanged: function() { }
    };


} (jQuery, window, undefined));