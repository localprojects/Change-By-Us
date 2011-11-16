/*--------------------------------------------------------------------
  Copyright (c) 2011 Local Projects. All rights reserved.
  Licensed under the Affero GNU GPL v3, see LICENSE for more details.
 --------------------------------------------------------------------*/

/**
 * File: Carousel
 * This file defines the carousel widget.
 *
 * Filename:
 * tc.gam.carousel.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 * - jqtools.scrollable.js
 */

/**
 * Class: tc.carousel
 */
tc.carousel = makeClass();

/**
 * Variable: tc.carousel.prototype.carousel
 * Internal reference to the carousel object.
 */
tc.carousel.prototype.carousel = null;

/**
 * Function: tc.carousel.prototype.init
 * Initialize the carousel at creation time. See
 * makeClass() for more details.
 *
 * Parameters:
 * options - {Object} Setup options object literal
 */
tc.carousel.prototype.init = function(options) {
    tc.util.log('tc.carousel.init');
    
    //Extend the options
    this.options = tc.jQ.extend({
        element: null,
        next_button:null,
        prev_button:null,
        scrollable: {
            items: '.items',
            speed: 300,
            circular: true
        },
        scrollPaneSelector: '.scrollable:first',
        pagination: false // { current: jQuery obj, total: jQuery obj }
    }, options);
    
    this.rendered = false;
    
    if (this.has_items() && this.options.element.is(':visible')) {
        this.render();
    } else {
        tc.util.log('postponing carousel rendering', 'warn');
    }
};

/**
 * Function: tc.carousel.prototype.destroy
 * Destroy the widget and unbind events.
 */
tc.carousel.prototype.destroy = function() {
    this.options.element.find(this.options.scrollPaneSelector).removeData('scrollable');
    if (this.next_btn) {
        this.next_btn.unbind('click');
    }
    if (this.prev_btn) {
        this.prev_btn.unbind('click');
    }   
};

/**
 * Function: tc.carousel.prototype.render
 * Render the widget.
 *
 * Parameters:
 * width - {Number} 
 * height - {Number} 
 */
tc.carousel.prototype.render = function(width, height) {
    var me, scrollpane, w, h;
    tc.util.log('tc.carousel.render');
    if (this.rendered === true) { 
        tc.util.log('carousel already rendered!!!', 'warn');
        return;
    }
    
    me = this;
    w = width || this.options.element.width();
    h = height || 0;
    
    //Set the width on the element
    this.options.element.width(w);
    
    //Set the scrollpane
    scrollpane = this.options.element.find(this.options.scrollPaneSelector);
    
    scrollpane.children(this.options.scrollable.items).children('li').each(function() {
        var item, item_height;
        item = tc.jQ(this);
        item.width(w);
        item_height = item.outerHeight();
        if (item_height > h) {
            h = item_height;
        }
    });
    
    //Set the scrollpane height
    scrollpane.height(h);
    this.carousel = scrollpane.scrollable(this.options.scrollable).data('scrollable');
    
    //
    this.carousel.onSeek(function(e, i) {
        me.update_pagination();
    });
    
    //
    this.carousel.onAddItem(function(e, i) {
        me.update_navigation();
        me.update_pagination();
    });
    
    //Handle the next button
    if(!this.next_btn){
        if(this.options.next_button){
            this.next_btn = this.options.next_button;
            this.next_btn.bind('click', {carousel:this.carousel}, function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.carousel.next();
            });
        } else {
            this.next_btn = this.options.element.find('.next');
            this.next_btn.bind('click', function(e) {
                e.preventDefault();
            });
        }
    }
    
    //Handle the previous button
    if(!this.prev_btn){
        if(this.options.prev_button){
            this.prev_btn = this.options.prev_button;
            this.prev_btn.bind('click', {carousel:this.carousel}, function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.data.carousel.prev();
            });
        } else {
            this.prev_btn = this.options.element.find('.prev');
            this.prev_btn.bind('click', function(e) {
                e.preventDefault();
            });
        }
    }
    
    this.rendered = true;
    this.update_navigation();
    this.update_pagination();
};

/**
 * Function: tc.carousel.prototype.update_navigation
 * If the carousel has only one item, hide the next/prev buttons
 */
tc.carousel.prototype.update_navigation = function() {
    if (!this.rendered) { return; }
    tc.util.log('tc.carousel.update_navigation');
    if (this.carousel.getSize() < 2) {
        if (this.next_btn) { this.next_btn.hide(); }
        if (this.prev_btn) { this.prev_btn.hide(); }
    } else {
        if (this.next_btn) { this.next_btn.show(); }
        if (this.prev_btn) { this.prev_btn.show(); }
    }
    return this;
};

/**
 * Function: tc.carousel.prototype.update_pagination
 * Update the current page and the total pages.
 */
tc.carousel.prototype.update_pagination = function() {
    if (!this.options.pagination || !this.rendered) { return; }
    tc.util.log('tc.carousel.update_pagination');
    if (this.options.pagination) {
        this.options.pagination.current.text( this.carousel.getIndex() + 1 );
        this.options.pagination.total.text( this.carousel.getSize() );
    }
    return this;
};

/**
 * Function: tc.carousel.prototype.has_items
 * Returns whether or not the carousel has any items.
 */
tc.carousel.prototype.has_items = function() {
    return ( this.options.element.find(this.options.scrollPaneSelector).
             children(this.options.scrollable.items).
             children('li').length > 0 );
};

/**
 * Function: tc.carousel.prototype.is_rendered
 * Returns whether or not the carousel is rendered.
 */
tc.carousel.prototype.is_rendered = function() {
    return this.rendered;
};

/**
 * Function: tc.carousel.prototype.get_element
 * Returns the jQuery object of the element.
 */
tc.carousel.prototype.get_element = function(){
    return this.options.element;
};
