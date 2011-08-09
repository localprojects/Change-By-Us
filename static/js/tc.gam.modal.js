/**
 * File: Modal
 * This file defines the modal widget.
 *
 * Filename:
 * tc.gam.modal.js
 * 
 * Dependencies:
 * - tc.gam.base.js
 * - tc.utils.js
 */

 /**
  * Class: tc.modal
  */
tc.modal = makeClass();

/**
 * Variable: tc.modal.prototype.modal
 * Internal reference to the modal object.
 */
tc.modal.prototype.modal = null;

/**
 * Function: tc.modal.prototype.init
 * Initialize the modal at creation time. See
 * makeClass() for more details.
 *
 * Parameters:
 * app - {Object} Reference to the application (app_page)
 * options - {Object} Setup options object literal
 */
tc.modal.prototype.init = function(app, options){
    tc.util.log('tc.modal.init');
    
    //Extend the options
    this.options = tc.jQ.extend({
        element: null
    }, options);
    
    console.log(this.options);
    
    //Init the overlay with set options
    this.options.element.overlay({
        top: '15%',
        left: 'center',
        fixed: false,
        speed: 75,
        mask: {
            color: '#55504b',
            opacity: 0.5,
            zIndex: 19998
        }
    });
    
    //Set the internal reference
    this.modal = this.options.element.data('overlay');
};


/**
 * Function: tc.modal.prototype.show
 * Shows the modal dialog according to the given parameters.
 *
 * Parameters:
 * opts - {Object} Options for how to handle the show event. Includes:
 *        * source_element (required) - a jQuery object containing a template of
 *            the content to be shown inside the modal. This is expected to have
 *            a class of template-content
 *        * submit - a function that will be executed if someone clicks an element
 *            with a class of "submit".
 *        * preventClose - prevent the modal from closing (?)
 *        * init - a hook to do custom initialization
 * event_target - {Object} An object passed into the init function (?)
 */
tc.modal.prototype.show = function(opts, event_target){
    tc.util.log('tc.modal.show');

    var content = '';
    
    function load(me){
        me.modal.load();
    }
    
    if(opts.source_element){
        content = opts.source_element.clone().removeClass('template-content');
    }
    
    this.options.element.children().remove();
    content.show();
    
    this.options.element.append(content);

    //Bind events
    tc.util.dump(this.options.element.find('.close'));
    
    //Hide the modal when someone clicks elements with "close" or "cancel" classes
    this.options.element.find('.close, .cancel').bind('click',{me:this},function(e){
        e.preventDefault();
        e.data.me.hide();
    });
    
    //Call the opts.submit function if it exists when someone clicks an element with a "submit" class
    this.options.element.find('.submit').bind('click',{me:this,opts:opts},function(e){
        e.preventDefault();
        e.data.me.hide();
        if(tc.jQ.isFunction(e.data.opts.submit)){
            e.data.opts.submit();
        }
    });
    
    //Prevent the modal from closing if explicitly specfied
    this.options.element.bind('onBeforeClose',{me:this, opts:opts},function(e){
        if(e.data.opts.preventClose){
            return false;
        }
        return true;
    });
    
    //Clean up on close
    this.options.element.bind('onClose',{me:this},function(e){
        var me;
        me = e.data.me;
        if (tc.jQ.isFunction(me.cleanup)) {
            me.cleanup.apply(me);
            me.cleanup = null;
        }
        me.options.element.children().remove();
    });
    
    //call opts.init if provided, otherwise call load()
    if(tc.jQ.isFunction(opts.init)){
        if (event_target) {
            opts.init(this, event_target, load);
        } else {
            opts.init(this, load);
        }
    } else {
        load(this);
    }
};

/**
 * Function: tc.modal.prototype.hide
 * Hide the modal.
 */
tc.modal.prototype.hide = function(){
    tc.util.log('tc.modal.hide');
    this.modal.close();
};