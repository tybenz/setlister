/**
* wp-infinite-scroller.js - version 0.1 - WebPro Release 0.1
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

// An extremely brain-dead version of inifinite scrolling.
// This class does not load data or generate any content,
// it simply manages when data/markup should be loaded
// into a scrollview as the user scrolls towards the bottom
// of the scrollview. The caller's loadFunc will be invoked
// and passed a deferred object. The loadFunc must call
// the resolve() method on the deferred object after it
// has loaded and rendered new data before any further
// scroll tracking will occur.

(function( $, WebPro, window, document, undefined ){

WebPro.widget( 'InfiniteScroller', WebPro.Widget, {
    _widgetName: "inifinite-scroller",

    defaultOptions: {
        loadFunc: null,
        clickEvent: 'click',
        triggerSelector: '.wp-infinite-scroller-trigger'
    },

    _attachBehavior: function() {
        var widget = this,
            options = this.options;

        this._triggerEnabled = true;

        this.$trigger = this.$element.find( options.triggerSelector );

        // We register a click handler on the trigger just in case
        // the browser fails to generate a scroll event. This can happen
        // in some platforms like iOS Safari when the web-page is scaled
        // up or down.

        this.$trigger.on( options.clickEvent, function( e ) {
                widget.triggerLoad();
                return false;
            });

        // Listen to scroll events on the widget's top-level element,
        // or any specified scrollview instance. Notice that we use
        // bind() so that we are compatible with jQuery and any scrollview
        // widget instance we may be given.

        var scroller = options.scrollview ? options.scrollview : this.$element;
        this.bindToScrollEvent(function( e ) {
                return widget._handleScroll( e );
            });
    },

    bindToScrollEvent: function( callback ) {
        var widget = this;

        this.$element.on( 'scroll', function( e ) {
                return widget._handleScroll( e );
            });
    },

    triggerIsEnabled: function() {
      return this._triggerEnabled;
    },

    enableTrigger: function() {
        this._triggerEnabled = true;
    },

    disableTrigger: function() {
        this._triggerEnabled = false;
    },

    getScrollerClientBounds: function() {
        return this.$element[ 0 ].getBoundingClientRect();
    },

    getTriggerClientBounds: function() {
        return this.$trigger[ 0 ].getBoundingClientRect();
    },

    triggerLoad: function() {
        if ( this._triggerEnabled ) {
            this.trigger( 'before-load' );

            var widget = this,
                options = this.options,
                deferred = $.Deferred();

            deferred
                .done(function() {
                    widget._handleLoadComplete();
                })
                .fail(function() {
                    widget._handleLoadFailed();
                });

            this.$trigger.addClass( 'loading' );
            this.disableTrigger();

            if ( options.loadFunc ) {
                options.loadFunc( this.$trigger, deferred );
            }
        }
    },

    _handleLoadComplete: function() {
        this.$trigger.removeClass( 'loading' );
        this.enableTrigger();
        this.trigger( 'load' );
    },

    _handleLoadFailed: function() {
        this.$trigger.removeClass( 'loading' );
        this.enableTrigger();
        this.trigger( 'load-failed' );
    },

    _handleScroll: function( e ) {
        if ( this._triggerEnabled ) {
            var scrollerBounds = this.getScrollerClientBounds(),
                triggerBounds = this.getTriggerClientBounds();

            if ( triggerBounds.left < ( scrollerBounds.left + scrollerBounds.width )
                  && triggerBounds.top < ( scrollerBounds.top + scrollerBounds.height )  ) {
                this.triggerLoad();
            }
        }
    }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpInfiniteScroller', WebPro.Widget.InfiniteScroller );

})( jQuery, WebPro, window, document );

