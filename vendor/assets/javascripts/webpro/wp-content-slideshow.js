/**
* wp-content-slideshow.js - version 0.1 - WebPro Release 0.1
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

WebPro.widget( "Widget.ContentSlideShow", WebPro.Widget.SlideShowBase, {
    _widgetName: "content-slideshow",

    defaultOptions: {
        slideshowClassName:      "wp-slideshow",
        clipClassName:                   "wp-slideshow-clip",
        viewClassName:                   "wp-slideshow-view",
        slideClassName:                  "wp-slideshow-slide",
        slideLinkClassName:      "wp-slideshow-slide-link",
        firstBtnClassName:       "wp-slideshow-first-btn",
        lastBtnClassName:            "wp-slideshow-last-btn",
        prevBtnClassName:            "wp-slideshow-prev-btn",
        nextBtnClassName:            "wp-slideshow-next-btn",
        playBtnClassName:            "wp-slideshow-play-btn",
        stopBtnClassName:            "wp-slideshow-stop-btn",
        playingClassName:            "wp-slideshow-playing"
    },

    _findWidgetElements: function( selector ) {
        var ssEle = this.$element[ 0 ];
        return WebPro.scopedFind( ssEle, selector, this.options.slideshowClassName, ssEle );
    },

    _attachBtnHandler: function( className, funcName ) {
        var self = this;

        // Attach a handler to buttons with the specified
        // class name. The handler will invoke a method on
        // the slideshow specified by funcName. After finding
        // the buttons, store a reference to them on the slideshow
        // so we don't have to search for them again.

        this[ "$" + funcName + "Btn" ] = this._findWidgetElements( "." + className )
            .bind( "click", function( e ) {
                self[ funcName ]();
                e.preventDefault();
            });
    },

    _attachBehavior: function() {
        var self = this,
            opts = this.options;

        WebPro.Widget.ContentSlideShow.prototype._super.prototype._attachBehavior.call( this );

        this._panelShowCallback = function( e, data) {
            if ( !self._ssTimerTriggered ) {
                // The current panel changed but it wasn't due
                // to our slideshow timer callback. If the slideshow
                // is running, reset the timer so the user has time
                // to view the content on the new panel.
    
                if ( self.isPlaying() ) {
                    self._startTimer();
                }
            }
        };

        // Add our internal class to the top-level slideshow element, we
        // will use this to ehlp us filter out any slides/controls in any
        // nested slideshows.

        this.$element.addClass( opts.slideshowClassName );

        var $slides = this._findWidgetElements( "." + opts.slideClassName ),
            $tabs =       this._findWidgetElements( "." + opts.slideLinkClassName );

        this.slides = new WebPro.Widget.PanelGroup( $slides, {
                                defaultIndex: ( opts.defaultIndex || 0 )
                            });
        this.slides.bind( "wp-panel-show", this._panelShowCallback );

        this.tabs = null;

        if ( $tabs.length ) {
            this.tabs = new WebPro.Widget.TabGroup( $tabs );
            this.slides.addTabGroup( this.tabs );
        }

        this._attachBtnHandler( opts.firstBtnClassName, "first" );
        this._attachBtnHandler( opts.lastBtnClassName, "last" );
        this._attachBtnHandler( opts.prevBtnClassName, "previous" );
        this._attachBtnHandler( opts.nextBtnClassName, "next" );
        this._attachBtnHandler( opts.playBtnClassName, "play" );
        this._attachBtnHandler( opts.stopBtnClassName, "stop" );

        // Bind to the play and stop events so we can add and remove
        // a class on the slideshow element that indicates whether
        // or not it is in play mode. We use listeners instead of
        // overriding the play() and stop() methods because we want
        // to give plugins a chance to cancel play/stop requests. If
        // the play and stop events fire, then we know it is okay
        // to add/remove the class.

        this.bind( "wp-slideshow-play", function() {
                this.$element.addClass( opts.playingClassName );
            });
        this.bind( "wp-slideshow-stop", function() {
                this.$element.removeClass( opts.playingClassName );
            });
    },

    _first: function() {
        this.slides.showPanel( 0 );
    },

    _last: function() {
        var slides = this.slides;
        slides.showPanel( slides.$element.length - 1 );
    },

    _previous: function() {
        var slides = this.slides,
            ai = slides.activeIndex;
        slides.showPanel( ( ai < 1 ? slides.$element.length : ai ) - 1 );
    },

    _next: function() {
        var slides = this.slides,
            ai = slides.activeIndex;
        slides.showPanel( ( ai + 1 ) % slides.$element.length );
    },

    _goTo: function() {
        this.slides.showPanel.apply( this.slides, arguments );
    }
});

})( jQuery, WebPro, window, document );

