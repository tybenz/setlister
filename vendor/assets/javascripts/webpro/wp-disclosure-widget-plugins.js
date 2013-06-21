/**
* wp-disclosure-widget-plugins.js - version 0.1 - WebPro Release 0.1
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

// This is a disclosure widget plugin that simply manipulates the CSS display
// property to hide and show the widget panels. Ideally this would be done
// using CSS classes, but this plugin is provided for those environments where
// the display must be manipulated via javascript.

WebPro.Widget.Disclosure.DisplayPropertyTransitionPlugin = {
    defaultOptions: {
    },

    initialize: function( widget, options ) {
        var plugin = this;

        // The idea here is that we only want to override props that aren't already
        // specified in the options we were      given. We then write back the merged
        // results into the original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Attach our behavior after the widget attaches its behaviors.

        widget.bind( "attach-behavior", function() {
            plugin._attachBehavior( widget );
        });
    },

    _attachBehavior: function( widget ) {
        var plugin = this,
            panels = widget.panels,
            $panels = panels.$element,
            activeIndex = panels.activeIndex;

        // Set the display property of any panel to
        // be shown to block.

        panels.bind( "wp-panel-show", function( e, data ) {
            data.panel.style.display = "block";
        });

        // Set the display property of any panel to
        // be hidden to none.

        panels.bind( "wp-panel-hide", function( e, data ) {
            data.panel.style.display = "none";
        });

        // Set the initial display of each panel.

        $panels.each( function( index, ele ) {
            this.style.display = ( index !== activeIndex ) ? "none" : "block";
        });
    }
};

// This is a disclosure widget plugin that uses javascript to animate the
// open and closing of the widget panels. Ideally CSS3 transitions/animations
// would be used, but if content is supposed to animate in older browsers that
// don't support CSS3, this plugin can be used.

WebPro.Widget.Disclosure.AccordionTransitionPlugin = {
    defaultOptions: {
        transitionDirection: "vertical", // "vertical" | "horizontal" | "both"
        transitionDuration:      500                         // msecs
    },

    initialize: function( widget, options ) {
        var plugin = this;

        // The idea here is that we only want to override props that aren't already
        // specified in the options we were      given. We then write back the merged
        // results into the original options object so the caller gets our changes.

        $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );

        // Attach our behavior after the widget attaches its behaviors.

        widget.bind( "attach-behavior", function() {
            plugin._attachBehavior( widget );
        });
    },

    _attachBehavior: function( widget ) {
        var plugin = this,
            panels = widget.panels,
            $panels = panels.$element,
            activeIndex = panels.activeIndex,
            direction = widget.options.transitionDirection;

        // Make sure the panel elements are all set to overflow:hidden.

        $panels.css( "overflow", "hidden" );

        // Fire-off a transition that opens a panel whenever
        // a panel-show event is recieved.

        panels.bind( "wp-panel-show", function( e, data ) {
            plugin._showPanel( widget, data );
        });

        // Fire-off a transition that closes a panel whenever
        // a panel-hide event is recieved.

        panels.bind( "wp-panel-hide", function( e, data ) {
            plugin._hidePanel( widget, data );
        });


        $panels.each( function( index, ele ) {
            if ( index !== activeIndex ) {
                if ( direction === "vertical" || direction === "both" ) {
                    this.style.height = "0";
                }
        
                if ( direction === "horizontal" || direction === "both" ) {
                    this.style.width = "0";
                }
            }
        });
    },

    _showPanel: function( widget, data ) {
        var opts = widget.options,
            direction = opts.transitionDirection,
            $panel = $( data.panel ),
            props = {};

        if ( direction === "vertical" || direction === "both" ) {
            props.height = $panel[ 0 ].scrollHeight + "px";
        }

        if ( direction === "horizontal" || direction === "both" ) {
            props.width = $panel[ 0 ].scrollWidth + "px";
        }

        $panel
                // Force any previous animations to jump to their end.
        
                .stop( true, true )

                // Fire off a new open animation.

                .animate( props, {
                        duration: opts.transitionDuration,
                        complete: function() {
                                var props = {};

                                if ( direction === "vertical" || direction === "both" ) {
                                    props.height = "auto";
                                }
                        
                                if ( direction === "horizontal" || direction === "both" ) {
                                    props.width = "auto";
                                }
        
                                $panel.css( props );
                            }
                    });
    },

    _hidePanel: function( widget, data ) {
        var opts = widget.options,
            direction = opts.transitionDirection,
            $panel = $( data.panel ),
            props = {};

        if ( direction === "vertical" || direction === "both" ) {
            props.height = "0";
        }

        if ( direction === "horizontal" || direction === "both" ) {
            props.width = "0";
        }

        $panel
                // Force any previous animations to jump to their end.
        
                .stop( true, true )

                // Fire off a new close animation.

                .animate( props, { duration: opts.transitionDuration } );
    }
};

})( jQuery, WebPro, window, document );

