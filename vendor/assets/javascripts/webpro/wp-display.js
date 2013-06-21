/**
* wp-display.js - version 0.1 - WebPro Release 0.1
*
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*       * Redistributions of source code must retain the above copyright notice,
*             this list of conditions and the following disclaimer.
*       * Redistributions in binary form must reproduce the above copyright notice,
*             this list of conditions and the following disclaimer in the documentation
*             and/or other materials provided with the distribution.
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

WebPro.widget( "Widget.Display", WebPro.Widget, {
    _widgetName: "display",

    defaultOptions: {
        trigger: null,
        displayClass: "wp-display-show",
        hiddenClass: "wp-display-hide",
        activeClass: "wp-display-toggle-active",
        toggle: true,
        autoFocus: false,
        displayEvent: 'click',
        hideEvent: null,
        positionAround: {
            position: 'below',
            positionOffset: 10,
            align: 'right'
        },
    },

    _attachBehavior: function() {
        var self = this,
            opts = this.options;
        this.options.hideEvent = this.options.hideEvent || this.options.displayEvent;
        this.show = this.options.displayClass;
        this.hide = this.options.hideClass;
        this.$display = this.$element;
        if ( opts.trigger ) {
            this.$trigger = typeof opts.trigger == "string" ? $( opts.trigger ) : opts.trigger;
        } else {
            this.$trigger = $( 'body' );
        }

        this.$trigger.on( this.options.displayEvent, function( evt ) {
            self._handleEvent( evt );
        });
    },

    _handleEvent: function( evt ) {
        evt.preventDefault();
        var self = this;
        if ( this._displayIsHidden() ) {
            this._showDisplay();
            this._handleGlobalEvent = function( evt ) {
                var $target = $( evt.target );
                if ( !self._displayIsHidden() && ( !self.options.trigger || self.$trigger == $( 'body' ) ||
                    !$target.closest( self.$trigger ).length && !$target.closest( self.$display ).length ) ) {
                    self._hideDisplay();
                }
            };
            $( document ).on( self.options.hideEvent, self._handleGlobalEvent );
        } else {
            if ( this.options.toggle ) {
                this._hideDisplay();
            }
        }
    },

    _hideDisplay: function() {
        this.$display.removeClass( this.show ).addClass( this.hide );
        $( document ).off( this.options.hideEvent, this._handleGlobalEvent );
        this.$display.trigger( 'wp-display-hide' );
        this.$trigger.removeClass( this.options.activeClass );
    },

    _showDisplay: function() {
        this.$display.removeClass( this.hide ).addClass( this.show );
        if ( this.options.positionAround ) {
            pos = WebPro.positionElementAroundAnother( this.$trigger, this.$display, this.options.positionAround );
            this.$display.css({ left: pos.x + 'px', top: pos.y + 'px' });
        }
        this.$display.trigger( 'wp-display-show', this.$trigger );
        this.$trigger.addClass( this.options.activeClass );
        if ( this.options.autoFocus ) {
            this.$display.find( 'input[type=text]:first' ).focus();
        }
    },

    _displayIsHidden: function() {
        return !this.$display.hasClass( this.show );
    }

});

})( jQuery, WebPro, window, document );
