/**
* wp-animator.js - version 0.1 - WebPro Release 0.1
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


// A component class for triggering functionality at an interpolated interval.

var WebPro = WebPro || {};

( function( $, WebPro, window, document, undefined ) {

WebPro.Animator = function( callback, options )
{
      this.options = $.extend( {}, WebPro.Animator.prototype.defaultOptions, options );
      this._startTime = 0;
      this._timer = 0;
      this._callback = callback;
      this._running = false;

      if ( this.options.easingFunc ) {
            this._easingFunc = this.options.easingFunc;
      } else {
            var easing = this.options.easing || 'linear';
            this._easingFunc = this.easings[ easing ] || this.easings[ 'linear' ];
      }

      var animator = this;
      this._updateCallback = function() {
                  animator._handleUpdate();
            };
}

$.extend( WebPro.Animator.prototype, {
      defaultOptions: {
                  interval: 1000 / 60, // FPS
                  duration: 1000,
                  easing: 'linear',
                  easingFunc: null
            },

      easings: {
                  'linear': function( x, t, b, c, d ) {
                              return b + ( ( c - b ) * t / d );
                        },
                  'ease-in': function( x, t, b, c, d ) {
                              return c*((t=t/d-1)*t*t + 1) + b;
                        },
                  'ease-out': function( x, t, b, c, d ) {
                              return c*(t/=d)*t*t + b;
                        }
            },

      start: function() {
            if ( !this._running ) {
                  $( this ).trigger( 'animator-start' );
                  this._startTime = ( new Date() ).getTime();
                  this._handleUpdate();
            }
      },

      stop: function() {
            this._running = false;

            if ( this._timer ) {
                  clearTimeout( this._timer );
                  this._timer = 0;
                  $( this ).trigger( 'animator-stop' );
            }
      },

      _handleUpdate: function() {
            var startTime = this._startTime,
                        elapsed = ( new Date() ).getTime() - startTime,
                        duration = this.options.duration;

            elapsed = elapsed > duration ? duration : elapsed;

            var interpolationConstant = this._easingFunc( 0, elapsed, 0, 1, duration );

            $( this ).trigger( 'animator-update', { interpolationConstant: interpolationConstant } );

            if ( this._callback ) {
                  this._callback( interpolationConstant );
            }

            if ( elapsed === duration ) {
                  if ( this.options.complete ) {
                        this.options.complete();
                  }
                  $( this ).trigger( 'animator-complete' );
                  this.stop();
            } else {
                  this._timer = setTimeout( this._updateCallback, this.options.interval );
            }
      }
});

})( jQuery, WebPro, window, document );
