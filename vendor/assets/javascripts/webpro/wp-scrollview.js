/**
* wp-scrollview.js - version 0.1 - WebPro Release 0.1
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

( function( $, WebPro, window, document, undefined ) {

WebPro.widget( 'Widget.ScrollView', WebPro.Widget, {
      defaultOptions: {
                  smoothScroll: true,
                  method: 'scroll' // scroll | offset | transform
            },

      _attachBehavior: function() {
            this._scrollX = 0;
            this._scrollY = 0;

            this.$inner = this.$element.children().first();
      },

      _ready: function() {
            // Set the initial position of the
            // scrolling view.

            this.scrollTo( this._scrollX, this._scrollY );
      },

      // Scroll to the specified x,y position.

      scrollTo: function( x, y ) {
            this.trigger( 'scroll-start', {
                        x: this._scrollX,
                        y: this._scrollY
                  });

            this._setScrollPosition( x, y );

            this.trigger( 'scroll-stop', {
                        x: this._scrollX,
                        y: this._scrollY
                  });
      },

      _translate3d: function( x, y ) {
            WebPro.setElementTransform( this.$inner, 'translate3d(' + x + 'px,' + y + 'px, 0)' );
      },

      // Position the view inside the scrolling
      // viewport at the specified x,y position.

      _setScrollPosition: function( x, y ) {
            x = x > 0 ? x : 0;
            y = y > 0 ? y : 0;

            switch ( this.options.method ) {
                  case 'offset':
                        this.$inner.css({
                                    left: ( -x ) + 'px',
                                    top: ( -y ) + 'px'
                              });
                        break;
                  case 'scroll':
                        this.$element[ 0 ].scrollLeft = x;
                        this.$element[ 0 ].scrollTop = y;
                        break;
                  case 'transform':
                        this._translate3d( -x, -y );
                        break;
            }

            this._scrollX = x;
            this._scrollY = y;

            this.trigger( 'scroll', {
                        x: this._scrollX,
                        y: this._scrollY
                  });
      },

      // Get the width of the scrolling viewport.

      getWidth: function() {
            return this.$element.width();
      },

      // Get the height of the scrolling viewport.

      getHeight: function() {
            return this.$element.height();
      },

      // Get the width of the content view
      // inside the scrolling viewport.

      getScrollWidth: function() {
            return this.options.method === 'scroll' ? this.$element[ 0 ].scrollWidth : this.$inner[ 0 ].offsetWidth;
      },

      // Get the height of the content view
      // inside the scrolling viewport.

      getScrollHeight: function() {
            return this.options.method === 'scroll' ? this.$element[ 0 ].scrollHeight : this.$inner[ 0 ].offsetHeight;
      },

      // Get the max scroll position in the
      // horizontal direction.

      getScrollMaxX: function() {
            var width = this.getScrollWidth() - this.getWidth();
            return width < 0 ? 0 : width;
      },

      // Get the max scroll position in the
      // vertical direction.

      getScrollMaxY: function() {
            var height = this.getScrollHeight() - this.getHeight();
            return height < 0 ? 0 : height;
      },

      // Get the current x,y scroll position of
      // the scrolling view.

      getPosition: function() {
            return {
                        x: this._scrollX,
                        y: this._scrollY
                  };
      }
});

WebPro.addWidgetConstructorAsjQueryPlugin( 'wpScrollView', WebPro.Widget.ScrollView );

})( jQuery, WebPro, window, document );
