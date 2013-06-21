/**
* wp-widgets.js - version 0.1 - WebPro Release 0.1
*
* Copyright (c) 2012. Adobe Systems Incorporated.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*       * Redistributions of source code must retain the above copyright notice,
*             this list of conditions and the following disclaimer.
*       * Redistributions in binary form must reproduce the above copyright notice,
*             this list of conditions and the following disclaimer in the documentation
*             and/or other materials provided with the distribution.
*       * Neither the name of Adobe Systems Incorporated nor the names of its
*             contributors may be used to endorse or promote products derived from this
*             software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
* INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
* CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
* ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

(function( $, WebPro, window, document, undefined ){


//////////////////// Widget ////////////////////


function Widget()
{
    WebPro.EventDispatcher.call( this );

    this._initialize.apply( this, arguments );
}

WebPro.inherit( Widget, WebPro.EventDispatcher );

$.extend(Widget.prototype, {

    defaultOptions: { },

    _widgetName: "Widget",

    _initialize: function() {
        var options;
    
        this.plugins = [];
    
        // PHASE 1 - Setup
        //
        // Execute any widget code that must run prior to plugins
        // initializing. Note that widget constructors are allowed
        // to take any number of arguments. The setUp() method is
        // the only means that any derived class has of accessing
        // the arguments passed into the constructor. Also note that
        // there is no required argument ordering enforced so it is
        // up to the _setUp() method to return any options object that
        // may have been passed into the constructor. This is an important
        // detail that derived classes with a _setUp() override
        // must implement. Failing to return an options object specified
        // at construction time will result in the defaultOptions
        // being used.
    
        var e = this.trigger( "before-setup" );
        if ( ! e.isDefaultPrevented() ) {
            options = this._setUp.apply( this, arguments );
            this.trigger( "setup" )
        }
    
        // PHASE 2 - Plugin Initialization
        //
        // First thing we do is call initializePlugins. We pass it
        // the options object we were given so that it can add or
        // remove options prior to the widget initializing itself.
    
        var e = this.trigger( "before-init-plugins" );
        if ( ! e.isDefaultPrevented() ) {
            this._initializePlugins( options );
            this.trigger( "init-plugins" )
        }
    
        // Save a copy of the options we were given. We start
        // with the default set of options specified within
        // the prototype, and then add in the options passed in
        // by the caller.
    
        this.options = $.extend( {}, this.defaultOptions, options );
    
        // PHASE 3 - Data Extraction
        //
        // Allow the widget to extract data from it's sources. This
        // includes any markup the widget might be attached to.
    
        e = this.trigger( "before-extract-data" );
        if ( ! e.isDefaultPrevented() ) {
            this._extractData();
            this.trigger( "extract-data" )
        }
    
        // PHASE 4 - Transform Markup
        //
        // Allow the widget to modify any associated markup.
        
        e = this.trigger( "before-transform-markup" );
        if ( ! e.isDefaultPrevented() ) {
            this._transformMarkup();
            this.trigger( "transform-markup" )
        }
    
        // PHASE 5 - Attach Behavior
        //
        // Attach any event handlers, etc on the newly transformed
        // widget markup.
    
        e = this.trigger( "before-attach-behavior" );
        if ( ! e.isDefaultPrevented() ) {
            this._attachBehavior();
            this.trigger( "attach-behavior" )
        }
    
        // PHASE 6 - Ready
        //
        // Allow the widget to execute any other initialization code
        // after the markup is transformed and behavior is attached.
    
        e = this.trigger( "before-ready" );
        if ( ! e.isDefaultPrevented() ) {
            this._ready();
            this.trigger( "ready" )
        }
    },

    _setUp: function( element, options ) {
        this.$element = $( element );
        return options;
    },

    _initializePlugins: function( opts ) {
        opts = opts || {};

        // Widgets can have a defaultPlugins property specified on their
        // prototypes. The user can prevent these plugins from running
        // for a specific widget instance, by passing a useDefaultPlugins:false
        // option property into the widget constructor.

        var useDefaults = typeof opts.useDefaultPlugins === "undefined" ? true : opts.useDefaultPlugins,
            defaultPlugins = ( useDefaults && this.defaultPlugins ) ? this.defaultPlugins : [],
            plugins = defaultPlugins.concat( opts.plugins || [] );

        // We sort the merged list of default and option specified plugins
        // based on priority (ascending order). Plugins with a lower-number
        // for priority execute first. If no priority is specified they are
        // given a default of 50.

        plugins = plugins.sort( function( a, b ) {
            a = typeof a.priority === "number" ? a.priority : 50;
            b = typeof b.priority === "number" ? b.priority : 50;
            return a - b;
        });

        // Now that we have a list of plugins sorted by priority,
        // execute them in the order they appear in the plugins array.

        for ( var i = 0; i < plugins.length; i++ ) {
            var p = plugins[ i ];
            if ( p && p.initialize ) {
                p.initialize( this, opts );
            }
        }

        this.plugins = plugins;
    },
    
    _extractData: function() {
        // Base class no-op.
    },

    _transformMarkup: function() {
        // Base class no-op.
    },

    _attachBehavior: function () {
        // Base class no-op.
    },

    _ready: function() {
        // Base class no-op.
    }
});

// Expose our Widget base class.

WebPro.Widget = Widget;


//////////////////// Widget Constructor Factory ////////////////////


// Expose our Widget constructor factory. We want all WebPro widgets to
// declare themselves using this factory so that they all follow the same
// Widget construction phases. This gives plugin authors a predictable
// initialization sequence they can hook into to extend functionality.

WebPro.widget = function( name, base, prototype ) {
    // The base and prototype args are optional, so make sure
    // we use default values when appropriate.

    var baseClass = ( prototype && base ) || WebPro.Widget,
        methods = prototype || base || {},

        // Declare the constructor for the widget. All widgets invoke the
        // base class constructor. Widgets muse make use of the Widget's
        // phase methods for initializing themselves.

        constructor = function() {
            baseClass.apply( this, arguments );

            this._widgetName = name;
        };

    // Simulate inheritance by setting up the class prototype chain.

    WebPro.inherit( constructor, baseClass );

    // Copy all of the methods for this widget on to its prototype object.

    $.extend( constructor.prototype, methods );

    // At this point the options object in the constructor's prototype
    // is either undefined, or pointing to one that is specified in the
    // methods dictionary. We need to create a new options object that is
    // a merged version of the options from the base class, and the one
    // that was specified in the methods dictionary.

    constructor.prototype.defaultOptions = $.extend( {}, baseClass.prototype.defaultOptions, methods.defaultOptions );

    // Now add it to our WebPro namespace.

    var nsArray = name.split( "." ),
        len = nsArray.length;
        namespace = ( len > 1 && nsArray[ 0 ] ) || "Widget",
        name = nsArray[ len - 1 ];

    WebPro[ namespace ][ name ] = constructor;
};

WebPro.addWidgetConstructorAsjQueryPlugin = function( pluginName, constructorFn ) {
    $.fn[ pluginName ] = function( options ) {
          var isAPICall = typeof arguments[ 0 ] === 'string',
                      fname = isAPICall ? arguments[ 0 ] : '',
                      args = isAPICall ? Array.prototype.slice.call( arguments, 1 ) : null;

          this.each( function() {
                      if ( isAPICall ) {
                            var widget = $( this ).data( pluginName );
                            if ( widget && widget[ fname ] ) {
                                  widget[ fname ].apply( widget, args );
                            }
                      } else {
                            $( this ).data( pluginName, new constructorFn( this, options ) );
                      }
                });

          return this;
    };
};

WebPro.addMultiElementWidgetConstructorAsjQueryPlugin = function( pluginName, constructorFn ) {
    $.fn[ pluginName ] = function( options ) {
        var isAPICall = typeof arguments[ 0 ] === 'string',
                  fname = isAPICall ? arguments[ 0 ] : '',
                  args = isAPICall ? Array.prototype.slice.call( arguments, 1 ) : null;

        if ( this.length ) {
            if ( isAPICall ) {
                var widget = this.eq( 0 ).data( pluginName );
                if ( widget && widget[ fname ] ) {
                      widget[ fname ].apply( widget, args );
                }
            } else {
                var widget = new constructorFn( this, options );
                this.each(function() {
                        $( this ).data( pluginName, widget );
                    });
            }
        }

        return this;
    };
};

})( jQuery, WebPro, window, document );

