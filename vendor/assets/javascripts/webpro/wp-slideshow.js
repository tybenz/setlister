/**
* wp-slideshow.js - version 0.1 - WebPro Release 0.1
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

WebPro.widget( "Widget.SlideShowBase", WebPro.Widget, {
    _widgetName: "slideshow-base",

    defaultOptions: {
        displayInterval: 6000,
        autoPlay: false
    },

    _setUp: function() {
        var self = this;

        this._ssTimer = 0;
        this._ssTimerTriggered = false;
        this._ssTimerCallback = function() {
            self._ssTimerTriggered = true;
            self.next();
            self._ssTimerTriggered = false;
        };

        return WebPro.Widget.prototype._setUp.apply( this, arguments );
    },

    _ready: function() {
        if ( this.options.autoPlay ) {
            this.play();
        }
    },

    play: function() {
        e = this.trigger( "wp-slideshow-before-play" );
        if ( ! e.isDefaultPrevented() ) {
            this._startTimer();
            this.trigger( "wp-slideshow-play" );
        }
    },

    stop: function() {
        e = this.trigger( "wp-slideshow-before-stop" );
        if ( ! e.isDefaultPrevented() ) {
            this._stopTimer();
            this.trigger( "wp-slideshow-stop" );
        }
    },

    isPlaying: function() {
        return this._ssTimer !== 0;
    },

    _startTimer: function() {
        this._stopTimer();
        this._ssTimer = setTimeout( this._ssTimerCallback, this.options.displayInterval );
    },

    _stopTimer: function() {
        if ( this._ssTimer ) {
            clearTimeout( this._ssTimer );
        }
        this._ssTimer = 0;
    },

    _executeCall: function( name, args ) {
        e = this.trigger( "wp-slideshow-before-" + name );
        if ( ! e.isDefaultPrevented() ) {
            // There are a couple of ways the slideshow can be stopped.
            // The first is to simply call stop() at any time. The 2nd,
            // is to simply return a true value from the method being
            // called.

            if ( this[ "_" + name ].apply( this, args) ) {
                this.stop();
            }

            // If we're still in slideshow mode, restart the timer
            // for the next slide.

            if ( this.isPlaying() ) {
                this._startTimer();
            }

            this.trigger( "wp-slideshow-" + name );
        }
    },

    first: function() {
        return this._executeCall( "first", arguments );
    },

    last: function() {
        return this._executeCall( "last", arguments );
    },

    previous: function() {
        return this._executeCall( "previous", arguments );
    },

    next: function() {
        return this._executeCall( "next", arguments );
    },

    goTo: function() {
        return this._executeCall( "goTo", arguments );
    },

    _first: function() {
        // Derived class must provide an implementation.
    },

    _last: function() {
        // Derived class must provide an implementation.
    },

    _previous: function() {
        // Derived class must provide an implementation.
    },

    _next: function() {
        // Derived class must provide an implementation.
    },

    _goTo: function() {
        // Derived class must provide an implementation.
    }
});

})( jQuery, WebPro, window, document );

