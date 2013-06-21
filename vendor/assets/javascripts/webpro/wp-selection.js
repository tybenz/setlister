/**
* wp-selection.js - version 0.1 - WebPro Release 0.1
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

var WebPro = WebPro || {};

(function( $, WebPro, window ) {

function SelectionManager( options )
{
    this.selectedItems = [];
    this.options = $.extend( {}, SelectionManager.options, options );
}

SelectionManager.options = {
    multiSelect: false,
    selectTogglesState: false
};

$.extend( SelectionManager.prototype, {
    clear: function() {
        var prev = this.selectedItems;
        $( this ).trigger( "selectionbeforeclear", { current: prev, delta: prev } );
        this.selectedItems = [];
        $( this ).trigger( "selectionclear", { prev: prev, current: [], delta: prev } );
    },

    select: function( items ) {
        items = this._ensureArray( items );
        var prev = this.selectedItems,
            data = { current: prev, delta: items };

        $( this ).trigger( "selectionbeforeset", data );

        this.selectedItems = data.delta.slice(0);

        $( this ).trigger( "selectionset", { prev: prev, current: data.delta, delta: data.delta } );
},

    add: function( items ) {
        items = this._ensureArray( items );
        var len = items.length,
            prev = this.selectedItems.slice( 0 ),
            data = { current: prev, delta: items },
            index, i;

        $( this ).trigger( "selectionbeforeadd", data );

        items = data.delta || [];

        for ( i = 0; i < len; i++ ) {
            index = this.getItemIndex( items[ i ] );
            if ( index < 0 ) {
                this.selectedItems.push( items[ i ] );
            }
        }

        $( this ).trigger( "selectionadd", { prev: prev, current: this.selectedItems.slice( 0 ), delta: items } );
    },

    remove: function( items ) {
        items = this._ensureArray( items );

        var len = items.length,
            prev = this.selectedItems.slice( 0 ),
            data = { current: prev, delta: items },
            index, i;

        $( this ).trigger( "selectionbeforeremove", data );

        items = data.delta;

        for ( i = 0; i < len; i++ ) {
            index = this.getItemIndex( items[ i ] );
            if ( index >= 0 ) {
                this.selectedItems.splice(index, 1);
            }
        }
        $( this ).trigger( "selectionremove", { prev: prev, current: this.selectedItems.slice( 0 ), delta: items } );
    },
    
    getSelection: function() {
        return this.selectedItems.slice(0);
    },

    getItemIndex: function( item ) {
        var items = this.selectedItems,
            len = items.length,
            i;
        
        for ( i = 0; i < len; i++ ) {
            if ( item === items[ i ] ) {
                return i;
            }
        }

        return -1;
    },

    itemIsSelected: function( item ) {
        return this.getItemIndex( item ) !== -1;
    },

    selectionExists: function() {
        return this.selectedItems.length > 0;
    },

    _ensureArray: function( item ) {
        // Normalize item so that it is an array. Note that this
        // method also takes into account the multiSelect option.
        // If multiSelect is true, this method only returns an
        // array with a single item in it.

        return $.isArray( item ) ? ( this.options.multiSelect ? item : [ item[ 0 ] ] ) : [ item ];
    }
});

// Expose module public functions/objects.

window.WebPro = WebPro;
window.WebPro.SelectionManager = SelectionManager;

})( jQuery, WebPro, window);

