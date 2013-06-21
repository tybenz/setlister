/**
* wp-button.js - version 0.1 - WebPro Release 0.1
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

WebPro.widget( "Widget.Button", WebPro.Widget, {
    defaultOptions: {
        hoverClass: "wp-button-hover",
        activeClass: "wp-button-down",
        disabledClass: "wp-button-disabled",
        disabled: false,
        callback: null,
        overEvent: 'mouseover',
        downEvent: 'mousedown',
        upEvent: 'mouseup',
        outEvent: 'mouseout',
        clickEvent: 'click'
    },

    _attachBehavior: function() {
        var self = this,
            options = this.options,
            muFunc = function( e ){
                    self.mouseDown = false;
                    self.$element.removeClass( self.options.activeClass );
                    $( document ).off( options.upEvent, muFunc );
                };

        this.mouseDown = false;

        this.$element
            .on( options.overEvent, function( e ){
                    if ( !self.options.disabled ) {
                        self.$element.addClass( self.options.hoverClass + ( self.mouseDown ? " " + self.options.activeClass : "" ) );
                    }
                })
            .on( options.outEvent, function( e ){
                    self.$element.removeClass( self.options.hoverClass + " " + self.options.activeClass );
                })
            .on( options.downEvent, function( e ){
                    if ( !self.options.disabled ) {
                        self.mouseDown = true;
                        self.$element.addClass( self.options.activeClass );
                        $( document ).on( options.upEvent, muFunc );
                    }
                })
            .on( options.clickEvent, function( e ) {
                    if ( !self.options.disabled && self.options.callback ) {
                        self.options.callback.call( this, e );
                    }

                    e.preventDefault();
                });

            this.disabled( this.options.disabled );
    },


    disabled: function( val ) {
        if ( typeof val === "boolean" ) {
            this.options.disabled = val;
            this.$element[ val ? "addClass" : "removeClass" ]( this.options.disabledClass );
        }

        return this.options.disabled;
    }
});


// Add a convenience method to the jQuery Collection prototype,
// that applies our Button behavior to all the elements in the collection.

$.fn.wpButton = function( options ) {
    this.each( function() {
        var b = new WebPro.Widget.Button( this, options );
        // XXX: We need to associate the Button instance object with
        //                  the element.
    });

    return this;
};

})( jQuery, WebPro, window, document );

