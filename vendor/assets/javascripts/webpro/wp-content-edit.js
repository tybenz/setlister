/**
* wp-content-edit.js - version 0.1 - WebPro Release 0.1
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

WebPro.widget( "Widget.ContentEdit", WebPro.Widget, {
    _widgetName: "content-edit",

    defaultOptions: {
        startEvent: 'vclick',
        editingClass: 'editing',
        enabled: true,
        clearOnEdit: false,
        stopKeyCode: 27
    },

    _extractData: function() {
    },

    _attachBehavior: function() {
        var self = this;
        this.originalValue = this.$element.html();
        this.$editField = $( '<textarea></textarea>' );
        this.enabled = true;
        if ( !this.options.enabled ) {
            this.disable();
        }
        this.$element.on( this.options.startEvent, function() {
            if ( self.enabled ) {
                self._edit();
            }
        });
    },

    disable: function() {
        if ( this.$element.hasClass( this.options.editingClass ) ) {
            this._stopEdit();
        }
        this.enabled = false;
    },

    enable: function() {
        this.enabled = true;
    },

    _edit: function() {
        var self = this,
            $content = this.$element,
            $edit = this.$editField,
            self = this;

        $edit.copyCSS( $content, null, [ 'display', 'cursor', 'position', 'top', 'left', 'bottom', 'right' ] );
        $edit.css( 'position', 'absolute' );
        $edit.css( 'left', $content.position().left + 'px' )
        $edit.css( 'top', $content.position().top + 'px' )
        $edit.height( $content.height() );
        $edit.width( $content.width() );

        $content.addClass( this.options.editingClass );
        $content.after( $edit );
        if ( !this.options.clearOnEdit ) {
            $edit.val( $content.text() );
        }
        $edit.focus().on( 'blur', function() {
            self._stopEdit();
        }).on( 'input', function( evt ) {
            self._update( evt );
        });

        this.trigger( 'wp-content-edit-start' );
        $content.trigger( 'wp-content-edit-start' );
    },

    _stopEdit: function() {
        var $content = this.$element,
            $edit = this.$editField;

        if ( $edit.val() === "" ) {
            $content.html( this.originalValue );
        } else {
            $content.text( $edit.val() );
        }
        $content.removeClass( this.options.editingClass );
        $edit.remove();

        this.trigger( 'wp-content-edit-stop' );
        $content.trigger( 'wp-content-edit-stop' );
    },

    _update: function( evt ) {
        var $content = this.$element,
            $edit = this.$editField;

        if ( evt.keyCode == this.options.stopKeyCode ) {
            evt.preventDefault();
            $edit.trigger( 'blur' );
        } else {
            this.trigger( 'wp-content-edit-update' );
            $content.trigger( 'wp-content-edit-update' );
        }
    }
});

$.fn.wpContentEdit = function( options ) {
  this.each( function() {
    var contentEdit = new WebPro.Widget.ContentEdit( this, options );
    $( this ).data( 'wp-content-edit', contentEdit );
  });
  return this;
};

})( jQuery, WebPro, window, document );
