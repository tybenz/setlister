/**
* wp-radio-group.js - version 0.1 - WebPro Release 0.1
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

// The RadioGroup widget is a class that manages the "checked" state for
// a group of buttons. The intent is to encapsulate this behavior in
// a re-useable class so that it can be used as the basis for other
// UI patterns, for example a Tab Group for tabbed panels or accordions.

WebPro.widget( "Widget.RadioGroup", WebPro.Widget, {
    _widgetName: "radio-group",

    defaultOptions: {
        defaultIndex: 0,
        hoverClass: "wp-radio-hover",
        downClass: "wp-radio-down",
        disabledClass: "wp-radio-disabled",
        checkedClass: "wp-radio-checked",
        disabled: false,
        toggleStateEnabled: false,
        overEvent: 'mouseover',
        downEvent: 'mousedown',
        upEvent: 'mouseup',
        outEvent: 'mouseout',
        clickEvent: 'click'
    },

    _attachBehavior: function() {
        var self = this;

        this.buttons = [];
        this.activeElement = null;
        this.activeIndex = -1;

        // The $element property for our radio-group is actually a collection of all the
        // elements that are part of the radio-group.

        this.$element.each(function() {
            self.buttons.push( self._addButtonBehavior( this ) );
        });

        // Set up the disabled state across all buttons that are part of
        // the radio-group.

        this.disabled( this.options.disabled );

        // If a defaultIndex is specified, check the
        // corresponding button.

        var defaultIndex = this.options.defaultIndex;
        if ( typeof defaultIndex === "number" && defaultIndex >= 0 ) {
            this.checkButton( defaultIndex );
        }
    },

    _addButtonBehavior: function( ele ) {
        var self = this,
            options = this.options,
            btn = new WebPro.Widget.Button( ele, {
                hoverClass: options.hoverClass,
                downClass: options.downClass,
                disabledClass: options.disabledClass,
                callback: function( e ) {
                    return self._handleClick( e, btn, ele );
                },
                overEvent: options.overEvent,
                downEvent: options.downEvent,
                upEvent: options.upEvent,
                outEvent: options.outEvent,
                clickEvent: options.clickEvent
            });

        return btn;
    },

    _handleClick: function( e, btn, ele ) {
        if ( !this.options.disabled ) {
            this.checkButton( ele );
        }
    },

    _getElementIndex: function( ele ) {
        return ele ? $.inArray( ele, this.$element.get() ) : -1;
    },

    _getElementByIndex: function( index ) {
        return this.$element.eq( index )[ 0 ];
    },
    
    _getElement: function( indexOrEle ) {
        return ( typeof indexOrEle === "number" ) ? this._getElementByIndex( indexOrEle ) : indexOrEle;
    },

    checkButton: function( indexOrEle ) {
        var ele = this._getElement( indexOrEle ),
            activeEle = this.activeElement,
            checkedClass = this.options.checkedClass;
        if ( ele ) {
            if ( ele !== activeEle ) {
                if ( activeEle ) {
                    $( activeEle ).removeClass( checkedClass );
                }
                $( ele ).addClass( checkedClass );
            } else if ( this.options.toggleStateEnabled ) {
                $( ele ).removeClass( checkedClass );
                ele = null;
            }

            this.activeElement = ele;
            this.activeIndex = this._getElementIndex( ele );
        }
    },

    disabled: function( val ) {
        if ( typeof val === "boolean" ) {
            this.options.disabled = val;
            $.each( this.buttons, function() {
                this.disabled( val );
            });
        }

        return this.options.disabled;
    }
});


// Add a convenience method to the jQuery Collection prototype,
// that applies our RadioGroup behavior to all the elements in the collection.

WebPro.addMultiElementWidgetConstructorAsjQueryPlugin( 'wpRadioGroup', WebPro.Widget.RadioGroup );

})( jQuery, WebPro, window, document );

