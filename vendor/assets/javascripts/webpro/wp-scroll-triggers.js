/**
* wp-scroll-triggers.js - version 0.1 - WebPro Release 0.1
*
* Copyright (c) 2013. Adobe Systems Incorporated.
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

(function( $, WebPro, window, document, undefined ) {


WebPro.widget( 'Widget.ScrollTriggers', WebPro.Widget, {
    defaultOptions: {
        triggerSelector: '.scroll-trigger',
        triggerScrollDirection: 'vertical', // 'vertical' || 'horizontal'
        triggerThreshold: .75 // Percentage of the view dimension that the element must exceed.
    },

    _attachBehavior: function() {
        var widget = this;

        // Find any trigger elements inside the container..

        this._$triggers = this._findTriggers();
        this._isVertical = this.options.triggerDirection != 'horizontal';

        // Listen for scroll events on the container.

        this.$element.on( 'scroll', function( e, data ) {
                widget._handleScroll();
            });
    },

    // When the widget is ready, attempt to sync the triggers
    // against the current scroll position of the container.

    _ready: function() {
        this.sync();
    },

    // Find all triggers within 
    _findTriggers: function() {
        return this.$element.find( this.options.triggerSelector );
    },

    update: function() {
        this._$triggers = this._findTriggers();
        this.sync();
    },

    sync: function() {
        this._handleScroll();
    },

    _handleScroll: function() {
        var widget = this,
            options = widget.options,
            numTriggers = widget._$triggers.length,
            clipBounds = widget.$element[ 0 ].getBoundingClientRect(),
            tx = clipBounds.left,
            isVertical = widget._isVertical,
            dimensionStart = isVertical ? 'top' : 'left',
            dimensionEnd = isVertical ? 'bottom' : 'right',
            dimension = isVertical ? 'height' : 'width',
            clipPos = clipBounds[ dimensionStart ],
            threshold = options.triggerThreshold * clipBounds[ dimension ];

        // Divide the set of triggers into those that are below the
        // threshold, and those that are above.

        var above = [],
            below = [],
            intersect = [];

        for ( var i = 0; i < numTriggers; i++ ) {
            var trigger = widget._$triggers[ i ],
                bounds = trigger.getBoundingClientRect(),
                posStart = bounds[ dimensionStart ] - clipPos,
                posEnd = bounds[ dimensionEnd ] - clipPos;

            // Is the current trigger above or below
            // our threshold?

            if ( posStart <= threshold ) {
                above.push( trigger );
            } else {
                below.push( trigger );
            }

            // Does the current trigger intersect
            // the viewport of the scrollview?

            if ( posStart < clipBounds[ dimension ] && posEnd > 0 ) {
                intersect.push( trigger );
            }
        }

        widget.$element.trigger( 'scroll-trigger', {
                above: above,
                below: below,
                intersect: intersect
            });
    }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpScrollTriggers', WebPro.Widget.ScrollTriggers );


///////// PLUGINS /////////

WebPro.Widget.ScrollTriggers.targetClassPlugin = {
    defaultOptions: {
        targetDataAttribute: 'triggerTarget', // @data-trigger-target attribute
        targetClass: 'triggered',
        filter: undefined
    },

    initialize: function( widget, options ) {
        var plugin = this;

        options = $.extend( options, $.extend( {}, plugin.defaultOptions, options ) );
        widget.bind( 'attach-behavior', function() {
                plugin._attachBehavior( widget );
            });
    },

    _attachBehavior: function( widget ) {
        var plugin = this,
            options = widget.options;

        widget._$triggers.each(function() {
                var $this = $( this ),
                    selector = $this.data( widget.options.targetDataAttribute );

                if ( selector ) {
                    var $target = $( selector );
                    if ( $target.length ) {
                        $this.data( 'tcpTarget', $target );
                    }
                }
            });

        widget.$element.bind( 'scroll-trigger', function( e, data ) {
                return plugin._handleScrollTrigger( widget, e, data );
            });
    },

    _handleScrollTrigger: function( widget, e, data ) {
        var options = widget.options,
            above = data.above,
            below = data.below,
            className = options.targetClass;

        if ( options.filter ) {
            options.filter.call( this, widget, data );
        }

        $( above ).each(function() {
                var $displayTarget = $( this ).data( 'tcpTarget' );
                if ( $displayTarget ) {
                    $displayTarget.addClass( className );
                }
            });

        $( below ).each(function() {
                var $displayTarget = $( this ).data( 'tcpTarget' );
                if ( $displayTarget ) {
                    $displayTarget.removeClass( className );
                }
            });
    }
};

})( jQuery, WebPro, window, document );
